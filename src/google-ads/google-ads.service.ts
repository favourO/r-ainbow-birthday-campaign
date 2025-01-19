import { Injectable } from '@nestjs/common';
import { GoogleAdsApi } from 'google-ads-api';

@Injectable()
export class GoogleAdsService {
  private client: GoogleAdsApi;

  constructor() {
    // Initialize the Google Ads client with environment variables or config
    this.client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      // If you manage sub-accounts, also set:
      // login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
    });
  }

  /**
   * Demonstration method that fetches search term data from the past 30 days
   * for a particular customer ID. Real usage depends on how your accounts
   * and search terms are actually structured.
   */
  async getRecentFoodSearches(customerId: string) {
    const customer = this.client.Customer({
      customer_id: customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID, // if using a manager account
    });

    // Example: last 30 days
    const thirtyDaysAgo = this.getDateXDaysAgo(30);
    const queryString = `
      SELECT
        search_term_view.search_term,
        segments.date
      FROM search_term_view
      WHERE segments.date >= '${thirtyDaysAgo}'
      ORDER BY segments.date DESC
      LIMIT 50
    `;

    // Instead of `customer.report({ query: queryString })`,
    // we call `customer.query(queryString)`
    const result = await customer.query(queryString);

    // result is an array of rows with the attributes defined in SELECT

    // If you only want terms containing the word "food":
    const foodTerms = result.filter((row: any) =>
      row.search_term_view.search_term.toLowerCase().includes('food'),
    );

    // Return them as an array of "product-like" objects for your logic
    return foodTerms.map((row: any) => {
      const term = row.search_term_view.search_term;
      return {
        name: `Suggested for: ${term}`,
        price: 9.99, // or any custom logic
      };
    });
  }

  private getDateXDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
