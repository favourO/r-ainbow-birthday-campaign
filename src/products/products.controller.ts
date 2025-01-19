import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findById(Number(id));
  }

  @Post()
  async create(@Body() dto: { name: string; price: number, imageUrl: string }) {
    return this.productsService.create(dto);
  }

  @Get('recommendations/:userId')
  async getUserRecommendations(@Param('userId') userId: string) {
    const id = parseInt(userId, 10);
    return this.productsService.getRecommendations(id);
  }
}