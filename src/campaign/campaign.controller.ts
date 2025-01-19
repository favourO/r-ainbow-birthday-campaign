import { Controller, Get } from '@nestjs/common';
import { CampaignService } from './campaign.service';

/**
 * For Testing, uses a Cron to schedule
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
