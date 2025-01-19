import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GoogleAdsModule } from '../google-ads/google-ads.module';
import { ProductsController } from './products.controller';
import { GoogleAdsService } from 'src/google-ads';

@Module({
  imports: [PrismaModule, GoogleAdsModule],
  providers: [ProductsService, GoogleAdsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
