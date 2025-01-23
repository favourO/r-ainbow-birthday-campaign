import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CampaignService } from '../campaign/campaign.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private isRunning = false; // Mutex flag

  constructor(private campaignService: CampaignService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleBirthdayCheck() {
    await this.campaignService.processUpcomingBirthdays();
  }
}
