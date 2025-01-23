// src/campaign/interfaces/campaign.interface.ts

export type CampaignType = 'birthday' | 'anniversary' | 'promotion'; // Extend as needed

export interface CampaignEmailOptions {
  email: string;
  name: string;
  code: string;
  recommendedProducts: any[]; // Define a proper type based on your product structure
  campaignType: CampaignType;
}

export interface Campaign {
  type: CampaignType;
  execute(user: any): Promise<void>;
}
