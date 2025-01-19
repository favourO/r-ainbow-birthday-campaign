// campaign.module.ts
import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { UsersModule } from '../users/users.module'; // Import the module that exports UsersService
import { ProductsService } from 'src/products/products.service';
import { EmailService } from 'src/email/email.service';
import { GoogleAdsService } from 'src/google-ads';

@Module({
  imports: [UsersModule], 
  providers: [CampaignService, ProductsService, EmailService, GoogleAdsService],
  controllers: [CampaignController]
})
export class CampaignModule {}