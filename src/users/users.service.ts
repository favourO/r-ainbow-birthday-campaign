import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UserWithDiscountCode {
  id: number;
  name: string;
  email: string;
  birthday: Date;
  birthdayEmailSent: boolean;
  discountCode: string | null;
}


@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(dto: { name: string; email: string; birthday: Date }) {
    return this.prisma.user.create({ data: dto });
  }

  /**
   * Find users whose birthday falls within the next `daysAhead` days.
   * @param daysAhead Number of days ahead to check for upcoming birthdays.
   * @returns Array of users with upcoming birthdays.
   */
  async findUsersWithUpcomingBirthday(daysAhead: number): Promise<UserWithDiscountCode[]> {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + daysAhead);

    // Format dates to 'MM-DD' for comparison
    const todayMonthDay = today.toISOString().slice(5, 10); // 'MM-DD'
    const targetMonthDay = targetDate.toISOString().slice(5, 10); // 'MM-DD'

    let users: UserWithDiscountCode[] = [];

    if (todayMonthDay <= targetMonthDay) {
      // No year wrap (e.g., Jan 10 to Jan 20)
      users = await this.prisma.$queryRaw<UserWithDiscountCode[]>`
        SELECT "User".id, "User".name, "User".email, "User".birthday, "User"."birthdayEmailSent",
               "DiscountCode"."code" AS "discountCode"
        FROM "User"
        LEFT JOIN "DiscountCode" ON "User".id = "DiscountCode"."userId" 
                                   AND "DiscountCode"."expiresAt" > NOW()
        WHERE to_char("User".birthday, 'MM-DD') BETWEEN ${todayMonthDay} AND ${targetMonthDay}
          AND "User"."birthdayEmailSent" = false
      `;
    } else {
      // Year wrap (e.g., Dec 25 to Jan 05)
      users = await this.prisma.$queryRaw<UserWithDiscountCode[]>`
        SELECT "User".id, "User".name, "User".email, "User".birthday, "User"."birthdayEmailSent",
               "DiscountCode"."code" AS "discountCode"
        FROM "User"
        LEFT JOIN "DiscountCode" ON "User".id = "discountCode"."userId" 
                                   AND "discountCode"."expiresAt" > NOW()
        WHERE (to_char("User".birthday, 'MM-DD') BETWEEN ${todayMonthDay} AND '12-31'
               OR to_char("User".birthday, 'MM-DD') BETWEEN '01-01' AND ${targetMonthDay})
          AND "User"."birthdayEmailSent" = false
      `;
    }

    this.logger.log(`Retrieved ${users.length} users with upcoming birthdays.`);

    return users;
  }
}