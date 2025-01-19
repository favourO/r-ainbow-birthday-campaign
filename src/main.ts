import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CampaignService } from './campaign';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  // Manually trigger the scheduler for testing
  // const campaignService = app.get(CampaignService);
  // await campaignService.processUpcomingBirthdays();
}
bootstrap();
