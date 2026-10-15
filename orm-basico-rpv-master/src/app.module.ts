import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TarefasModule } from './tarefas/tarefas.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [TarefasModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
