// src/campaign/guards/campaign.guard.ts

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CampaignGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    // Validate the API key
    if (apiKey && apiKey === process.env.CAMPAIGN_API_KEY) {
      return true;
    }

    throw new UnauthorizedException('Invalid or missing API key');
  }
}