import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleAdsService } from '../google-ads/google-ads.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private googleAdsService: GoogleAdsService,
  ) {}

  async findAll() {
    return this.prisma.product.findMany();
  }

  async findById(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async create(dto: { name: string; price: number, imageUrl: string }) {
    return this.prisma.product.create({ data: dto });
  }

  /**
   * Get recommendations based on favorites, purchases, cart items, and Google Ads.
   * @param userId User ID
   */
  async getRecommendations(userId: number) {
    // Fetch user to get Google Ads Customer ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return [];

    // Fetch recommendations from different sources
    const [favorites, purchased, cartItems] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        include: { product: true },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        where: { order: { userId } },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 3,
      }),
      this.prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      }),
    ]);

    // Get favorite products
    const favoriteProducts = favorites.map((f) => f.product);

    // Get most purchased products
    const purchasedProductIds = purchased.map((p) => p.productId);
    const purchasedProducts = await this.prisma.product.findMany({
      where: { id: { in: purchasedProductIds } },
    });

    // Get cart products
    const cartProducts = cartItems.map((c) => c.product);

    // Get Google Ads recommendations
    let adsData = [];
    // if (user.googleAdsCustId) {
    //   adsData = await this.googleAdsService.getRecentFoodSearches(user.googleAdsCustId);
    // }

    // Combine all recommendations
    const combined = [
      ...favoriteProducts,
      ...purchasedProducts,
      ...cartProducts,
      ...adsData,
    ];

    // Remove duplicates based on product name
    const uniqueProductsMap = new Map<string, any>();
    combined.forEach((product) => {
      if (!uniqueProductsMap.has(product.name)) {
        uniqueProductsMap.set(product.name, product);
      }
    });

    return Array.from(uniqueProductsMap.values());
  }
}
