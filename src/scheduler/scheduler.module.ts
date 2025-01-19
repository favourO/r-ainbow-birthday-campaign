// scheduler.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { CampaignModule, CampaignService } from 'src/campaign';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CampaignModule, 
  ],
  providers: [SchedulerService, CampaignService],
})
export class SchedulerModule {}
