// // src/campaign/campaign.service.ts

// import { Injectable, Logger } from '@nestjs/common';
// import { UsersService } from '../users/users.service';
// import { ProductsService } from '../products/products.service';
// import { EmailService } from '../email/email.service';
// import { PrismaService } from '../prisma/prisma.service';
// import { Prisma } from '@prisma/client';

// interface Product {
//   name: string;
//   price: number;
//   imageUrl: string;
// }

// @Injectable()
// export class CampaignService {
//   private readonly logger = new Logger(CampaignService.name);

//   constructor(
//     private readonly usersService: UsersService,
//     private readonly productsService: ProductsService,
//     private readonly emailService: EmailService,
//     private readonly prisma: PrismaService,
//   ) {}

//   /**
//    * Processes upcoming birthdays by retrieving existing discount codes
//    * and sending them to users via email. Updates the user record after sending.
//    */
//   async processUpcomingBirthdays(): Promise<void> {
//     try {
//       // Fetch users with upcoming birthdays within the next 7 days and haven't received the email yet
//       const users = await this.usersService.findUsersWithUpcomingBirthday(7);
//       this.logger.log(`Found ${users.length} users with upcoming birthdays.`);

//       if (users.length === 0) {
//         this.logger.log('No users with upcoming birthdays found.');
//         return;
//       }

//       // Process each user
//       for (const user of users) {
//         // Start a transaction for each user to ensure atomicity
//         await this.prisma.$transaction(async (prisma) => {
//           // Destructure user data
//           const { id, email, name, discountCode } = user;

//           if (discountCode) {
//             // Existing discount code found
//             this.logger.log(
//               `User ID ${id} has an existing discount code: ${discountCode}. Sending email...`,
//             );

//             // Prepare email parameters with existing discount code
//             const emailParams = {
//               email,
//               name,
//               code: discountCode,
//               recommendedProducts: await this.getRecommendedProducts(id),
//             };

//             // Send email
//             await this.sendEmailSafely(emailParams);

//             this.logger.log(`Sent birthday email with existing discount code to ${email}.`);

//             // Update the user record to mark that the birthday email has been sent
//             await prisma.user.update({
//               where: { id },
//               data: { birthdayEmailSent: true },
//             });

//             this.logger.log(`Updated User ID ${id} as email sent.`);
//           } else {
//             // No existing discount code; create a new one
//             this.logger.log(`No existing discount code for User ID ${id}. Creating a new one...`);

//             // Generate a new discount code
//             const newCode = this.generateDiscountCode();
//             const expiresAt = this.computeExpiresAt();

//             // Create the new discount code in the database
//             const discount = await prisma.discountCode.create({
//               data: {
//                 code: newCode,
//                 userId: id,
//                 expiresAt,
//               },
//             });

//             this.logger.log(`Created new discount code ${discount.code} for User ID ${id}.`);

//             // Prepare email parameters with the new discount code
//             const emailParams = {
//               email,
//               name,
//               code: discount.code,
//               recommendedProducts: await this.getRecommendedProducts(id),
//             };

//             // Send email
//             await this.sendEmailSafely(emailParams);

//             this.logger.log(`Sent birthday email with new discount code to ${email}.`);

//             // Update the user record to mark that the birthday email has been sent
//             await prisma.user.update({
//               where: { id },
//               data: { birthdayEmailSent: true },
//             });

//             this.logger.log(`Updated User ID ${id} as email sent.`);
//           }
//         });
//       }

//       this.logger.log('Completed processing upcoming birthdays.');
//     } catch (error) {
//       this.logger.error('An error occurred while processing upcoming birthdays:', error);
//     }
//   }

//   /**
//    * Safely sends an email and handles any errors without affecting the transaction.
//    * @param params Email parameters
//    */
//   private async sendEmailSafely(params: {
//     email: string;
//     name: string;
//     code: string;
//     recommendedProducts: Product[];
//   }): Promise<void> {
//     try {
//       await this.emailService.sendBirthdayEmail(params);
//     } catch (error) {
//       this.logger.error(`Failed to send email to ${params.email}:`, error);
//       // Optionally, implement retry logic or notify admins
//       throw error;
//     }
//   }

//   /**
//    * Retrieves recommended products for a user.
//    * @param userId User ID
//    * @returns Array of recommended products
//    */
//   private async getRecommendedProducts(userId: number): Promise<Product[]> {
//     try {
//       const recommendedProducts = await this.productsService.getRecommendations(userId);
//       this.logger.log(`Fetched ${recommendedProducts.length} recommended products for User ID ${userId}.`);
//       return recommendedProducts;
//     } catch (error) {
//       this.logger.error(`Failed to fetch recommended products for User ID ${userId}:`, error);
//       return []; // Return an empty array or a default value as needed
//     }
//   }

//   /**
//    * Generates a unique discount code.
//    * @returns Discount code string
//    */
//   private generateDiscountCode(): string {
//     return `BDAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
//   }

//   /**
//    * Computes the expiration date for the discount code.
//    * @returns Expiration Date object
//    */
//   private computeExpiresAt(): Date {
//     const date = new Date();
//     date.setDate(date.getDate() + 15); // Discount valid for 15 days
//     return date;
//   }
// }


// src/campaign/campaign.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Campaign } from './interfaces/campaign.interface';
import { BirthdayCampaign } from './birthdays.campaign';
// Import other campaign classes as they are implemented

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);
  private readonly campaigns: Record<string, Campaign> = {};

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly birthdayCampaign: BirthdayCampaign,
    // Inject other campaign classes
  ) {
    // Register campaigns
    this.campaigns['birthday'] = this.birthdayCampaign;
    // Register other campaigns here
  }

  /**
   * Processes a specific campaign type.
   * @param campaignType The type of campaign to process.
   */
  async processCampaign(campaignType: string): Promise<void> {
    const campaign = this.campaigns[campaignType];
    if (!campaign) {
      this.logger.error(`Unsupported campaign type: ${campaignType}`);
      return;
    }

    try {
      const users = await this.getUsersForCampaign(campaignType);
      this.logger.log(`Found ${users.length} users for ${campaignType} campaign.`);

      for (const user of users) {
        await this.prisma.$transaction(async (prisma) => {
          await campaign.execute(user);
        });
      }

      this.logger.log(`Completed processing ${campaignType} campaign.`);
    } catch (error) {
      this.logger.error(`An error occurred while processing ${campaignType} campaign:`, error);
    }
  }

  /**
   * Retrieves users relevant to the specified campaign.
   * @param campaignType The type of campaign.
   * @returns An array of user objects.
   */
  private async getUsersForCampaign(campaignType: string): Promise<any[]> {
    switch (campaignType) {
      case 'birthday':
        return this.usersService.findUsersWithUpcomingBirthday(7);
      // Add cases for other campaign types
      default:
        return [];
    }
  }
}
