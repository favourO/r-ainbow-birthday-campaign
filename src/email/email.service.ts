import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'), 
      secure: true, 
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'), 
      },
      logger: true,
      debug: true,  
      tls: {
        // You can add TLS options here if necessary
      },
    });

    // Verify SMTP configuration upon initialization
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('SMTP configuration is invalid:', error);
      } else {
        this.logger.log('SMTP configuration is valid.');
      }
    });
  }

  async sendBirthdayEmail(params: {
    email: string;
    name: string;
    code: string;
    recommendedProducts: any[];
  }) {
    const { email, name, code, recommendedProducts } = params;

    // Construct the HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Happy Birthday Week, ${this.escapeHtml(name)}!</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 90%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            margin: 20px 0;
          }
          .discount-code {
            background-color: #f9f9f9;
            padding: 10px;
            border-left: 4px solid #4CAF50;
            font-size: 1.2em;
            margin-bottom: 20px;
          }
          .products {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
          }
          .product {
            width: 48%;
            background-color: #f9f9f9;
            margin-bottom: 20px;
            border-radius: 5px;
            overflow: hidden;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .product img {
            width: 100%;
            height: auto;
          }
          .product-details {
            padding: 10px;
            text-align: center;
          }
          .product-name {
            font-size: 1.1em;
            margin: 10px 0;
            color: #333333;
          }
          .product-price {
            color: #4CAF50;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            color: #888888;
            font-size: 12px;
            margin-top: 20px;
          }
          .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          @media only screen and (max-width: 600px) {
            .product {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Happy Birthday Week, ${this.escapeHtml(name)}!</h2>
          </div>
          <div class="content">
            <p>Hi ${this.escapeHtml(name)},</p>
            <p>We have a special birthday discount just for you:</p>
            <div class="discount-code">
              <strong>${this.escapeHtml(code)}</strong>
            </div>
            <p>We think you'll love these items:</p>
            <div class="products">
              ${this.generateProductHtml(recommendedProducts)}
            </div>
            <a href="https://r-ainbow.com" class="button">Shop Now</a>
          </div>
          <div class="footer">
            <p>&copy; 2025 R-ainbow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'), 
      to: email,
      subject: `Happy Birthday Week, ${name}!`,
      html: htmlContent, // Use the constructed HTML content
      // Remove the 'text' field since we're sending HTML
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error; 
    }
  }

  /**
   * Generates HTML for the list of recommended products.
   * @param products Array of recommended products
   * @returns HTML string for products
   */
  private generateProductHtml(products: any[]): string {
    if (!products || products.length === 0) {
      return '<p>No product recommendations available at this time.</p>';
    }

    return products.map(product => `
      <div class="product">
        <img src="${this.escapeHtml(product.imageUrl)}" alt="${this.escapeHtml(product.name)}">
        <div class="product-details">
          <div class="product-name">${this.escapeHtml(product.name)}</div>
          <div class="product-price">$${product.price.toFixed(2)}</div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Escapes HTML special characters to prevent injection.
   * @param unsafe String to escape
   * @returns Escaped string
   */
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
