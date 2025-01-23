// src/campaign/campaigns/birthday.campaign.ts

import { Injectable, Logger } from '@nestjs/common';
import { Campaign, CampaignEmailOptions, CampaignType } from '../interfaces/campaign.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductsService } from '../../products/products.service';
import { EmailService } from '../../email/email.service';

@Injectable()
export class BirthdayCampaign implements Campaign {
  private readonly logger = new Logger(BirthdayCampaign.name);
  private readonly campaignType: CampaignType = 'birthday';

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Executes the birthday campaign for a user.
   * @param user The user object.
   */
  async execute(user: any): Promise<void> {
    // Validate user data
    if (!user.email || !this.isValidEmail(user.email)) {
      this.logger.warn(`User ID ${user.id} has an invalid or missing email. Skipping...`);
      return;
    }

    // Handle leap day birthdays
    const birthdayAdjusted = this.adjustLeapDay(user.birthday);

    // Check for existing discount code
    const existingDiscount = await this.prisma.discountCode.findFirst({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date(),
        },
        campaignType: this.campaignType,
      },
      orderBy: {
        expiresAt: 'desc',
      },
      select: {
        code: true,
        expiresAt: true,
      },
    });

    if (existingDiscount) {
      this.logger.log(
        `User ID ${user.id} already has an active discount code: ${existingDiscount.code}. Skipping...`,
      );
      return;
    }

    // Generate discount code
    const code = this.generateDiscountCode();
    const expiresAt = this.computeExpiresAt();

    try {
      const discount = await this.prisma.discountCode.create({
        data: {
          code,
          userId: user.id,
          expiresAt,
          campaignType: this.campaignType,
        },
      });
      this.logger.log(`Inserted discount code ${discount.code} for User ID ${user.id}.`);

      // Fetch recommended products
      const recommendedProducts = await this.productsService.getRecommendations(user.id);
      this.logger.log(`Fetched ${recommendedProducts.length} recommended products for User ID ${user.id}.`);

      // Send email
      const emailOptions: CampaignEmailOptions = {
        email: user.email,
        name: user.name,
        code: discount.code,
        recommendedProducts,
        campaignType: this.campaignType,
      };
      await this.emailService.sendCampaignEmail(emailOptions);
      this.logger.log(`Sent ${this.campaignType} email to ${user.email}.`);
    } catch (error) {
      this.logger.error(`Error processing User ID ${user.id}:`, error);
      throw error; // Propagate error to trigger transaction rollback
    }
  }

  /**
   * Validates the email format.
   * @param email The email address to validate.
   * @returns True if valid, else false.
   */
  private isValidEmail(email: string): boolean {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Generates a unique discount code.
   * @returns A unique discount code string.
   */
  private generateDiscountCode(): string {
    return `BDAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  /**
   * Computes the expiration date for a discount code (15 days from now).
   * @returns The expiration date as a Date object.
   */
  private computeExpiresAt(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 15); // Discount valid for 15 days
    return date;
  }

  /**
   * Adjusts leap day birthdays to March 1st in non-leap years.
   * @param birthday The original birthday date.
   * @returns The adjusted birthday date.
   */
  private adjustLeapDay(birthday: Date): Date {
    if (birthday.getMonth() === 1 && birthday.getDate() === 29) { // Months are 0-indexed
      const currentYear = new Date().getFullYear();
      if (!this.isLeapYear(currentYear)) {
        this.logger.warn(`User born on leap day. Adjusting birthday to March 1st for the year ${currentYear}.`);
        return new Date(currentYear, 2, 1); // March 1st
      }
    }
    return birthday;
  }

  /**
   * Determines if a year is a leap year.
   * @param year The year to check.
   * @returns True if leap year, else false.
   */
  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }
}
