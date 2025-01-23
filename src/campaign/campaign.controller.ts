// import { Controller, Get } from '@nestjs/common';
// import { CampaignService } from './campaign.service';

// /**
//  * For Testing, uses a Cron to schedule
//  */
// @Controller('campaign')
// export class CampaignController {
//   constructor(private campaignService: CampaignService) {}

//   @Get('run-birthday-campaign')
//   async runCampaign() {
//     console.log("Working")
//     await this.campaignService.processUpcomingBirthdays();
//     return { status: 'campaign triggered' };
//   }
// }


// src/campaign/campaign.controller.ts

import { Controller, Get, HttpCode, HttpStatus, Logger, UseGuards, Param } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignGuard } from './guards/campaign.guard';

@Controller('campaign')
export class CampaignController {
  private readonly logger = new Logger(CampaignController.name);

  constructor(private readonly campaignService: CampaignService) {}

  /**
   * Endpoint to manually trigger a specific campaign.
   * Protected by an authorization guard to prevent unauthorized access.
   * Example usage: /campaign/run-birthday-campaign
   */
  @Get('run-:campaignType')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CampaignGuard) // Implement authorization
  async runCampaign(@Param('campaignType') campaignType: string) {
    this.logger.log(`Manual trigger received for ${campaignType} campaign.`);
    try {
      await this.campaignService.processCampaign(campaignType as any);
      this.logger.log(`${campaignType} campaign triggered successfully via manual endpoint.`);
      return { status: 'campaign triggered successfully' };
    } catch (error) {
      this.logger.error(`Failed to trigger ${campaignType} campaign manually:`, error);
      return { status: 'campaign failed to trigger', error: error.message };
    }
  }
}
