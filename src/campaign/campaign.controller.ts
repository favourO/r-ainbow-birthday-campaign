import { Controller, Get } from '@nestjs/common';
import { CampaignService } from './campaign.service';

/**
 * Demo endpoints (optional).
 * In a real system, you might only run this via a Cron or an internal route
 */
@Controller('campaign')
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  @Get('run-birthday-campaign')
  async runCampaign() {
    console.log("Working")
    await this.campaignService.processUpcomingBirthdays();
    return { status: 'campaign triggered' };
  }
}
