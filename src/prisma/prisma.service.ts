import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor () {
    super ({
      datasources: {
        db: {
          url: 'postgresql://postgres:123456@localhost:5432/rainbow'
        }
      }
    })
  }
}