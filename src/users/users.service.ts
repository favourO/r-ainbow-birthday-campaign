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

  // async create(dto: { name: string; email: string; birthday: Date }) {
  //   return this.prisma.user.create({ data: dto });
  // }

  async createUser(data: CreateUserDto, deviceId: string, ipAddress: string): Promise<User> {
    // Check if device already has an account
    const existingDevice = await this.prisma.userDevice.findUnique({
      where: { deviceId },
    });

    if (existingDevice) {
      throw new ForbiddenException('An account has already been created from this device.');
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const attempts = await this.prisma.userRegistrationAttempt.count({
      where: {
        ipAddress,
        createdAt: { gt: oneHourAgo },
      },
    });

    if (attempts >= 5) { // Limit to 5 accounts per hour per IP
      throw new TooManyRequestsException('Too many account creation attempts from this IP. Please try again later.');
    }

    // Record the registration attempt
    await this.prisma.userRegistrationAttempt.create({
      data: { ipAddress },
    });

    // Proceed with user creation
    const verificationToken = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password, 
        verificationToken,
      },
    });

    // Associate device with user
    await this.prisma.userDevice.create({
      data: {
        userId: user.id,
        deviceId,
        ipAddress,
      },
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return user;
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