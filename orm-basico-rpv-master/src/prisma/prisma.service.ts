import 'dotenv/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('A variável DATABASE_URL não está definida.');
    }

    const adapter = new PrismaMariaDb(databaseUrl);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}