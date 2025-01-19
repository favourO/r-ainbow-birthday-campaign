import { Module } from '@nestjs/common';
import { EmailService, EmailModule, EmailController } from './email';
import { UsersController, UsersService, UsersModule } from './users';
import { ProductsModule, ProductsService, ProductsController } from './products';
import { GoogleAdsModule, GoogleAdsService } from './google-ads';
import { CampaignModule, CampaignService } from './campaign';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SchedulerService } from './scheduler/scheduler.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    ProductsModule, 
    EmailModule, 
    UsersModule, 
    GoogleAdsModule, 
    CampaignModule
  ],
  providers: [ProductsService, EmailService, UsersService, GoogleAdsService, CampaignService, SchedulerService],
  controllers: [ProductsController, EmailController, UsersController],
})
export class AppModule {}
