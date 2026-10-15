import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Prioridade } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TarefasController } from './tarefas.controller.js';
import { TarefasService } from './tarefas.service.js';

describe('TarefasController', () => {
    let app: INestApplication;
    const tarefa = {
        id: 1,
        titulo: 'Estudar NestJS',
        descricao: null,
        prazo: null,
        prioridade: Prioridade.MEDIA,
        concluida: false,
        criadaEm: new Date('2026-10-14T12:00:00.000Z'),
    };
    const prisma = {
        tarefa: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    };

    beforeEach(async () => {
        vi.resetAllMocks();
        const module = await Test.createTestingModule({
            controllers: [TarefasController],
            providers: [
                TarefasService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        app = module.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        );
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('creates a task with optional fields and a date-only deadline', async () => {
        prisma.tarefa.create.mockImplementation(async ({ data }) => ({
            ...tarefa,
            ...data,
            prioridade: data.prioridade ?? Prioridade.MEDIA,
        }));

        await request(app.getHttpServer())
            .post('/tarefas')
            .send({
                titulo: 'Estudar',
                descricao: 'Ler docs',
                prazo: '2026-12-31',
                prioridade: 'ALTA',
            })
            .expect(201)
            .expect(({ body }) => {
                expect(body.descricao).toBe('Ler docs');
                expect(body.prazo).toBe('2026-12-31T00:00:00.000Z');
                expect(body.prioridade).toBe('ALTA');
            });

        expect(prisma.tarefa.create).toHaveBeenCalledWith({
            data: {
                titulo: 'Estudar',
                descricao: 'Ler docs',
                prioridade: 'ALTA',
                prazo: new Date('2026-12-31'),
            },
        });
    });

    it('rejects an invalid deadline, too-long description and invalid priority', async () => {
        await request(app.getHttpServer())
            .post('/tarefas')
            .send({ titulo: 'Estudar', prazo: 'amanha' })
            .expect(400);

        await request(app.getHttpServer())
            .post('/tarefas')
            .send({ titulo: 'Estudar', descricao: 'x'.repeat(501) })
            .expect(400);

        await request(app.getHttpServer())
            .post('/tarefas')
            .send({ titulo: 'Estudar', prioridade: 'URGENTE' })
            .expect(400);

        expect(prisma.tarefa.create).not.toHaveBeenCalled();
    });

    it('lists tasks using all supplied filters and defaults to ascending creation date', async () => {
        prisma.tarefa.findMany.mockResolvedValue([]);

        await request(app.getHttpServer())
            .get('/tarefas?concluida=false&busca=nest&ordem=desc&prioridade=ALTA')
            .expect(200);

        expect(prisma.tarefa.findMany).toHaveBeenCalledWith({
            where: {
                concluida: false,
                prioridade: Prioridade.ALTA,
                titulo: { contains: 'nest' },
            },
            orderBy: { criadaEm: 'desc' },
        });

        await request(app.getHttpServer()).get('/tarefas').expect(200);
        expect(prisma.tarefa.findMany).toHaveBeenLastCalledWith({
            where: {},
            orderBy: { criadaEm: 'asc' },
        });

        await request(app.getHttpServer()).get('/tarefas?busca=%20%20').expect(200);
        expect(prisma.tarefa.findMany).toHaveBeenLastCalledWith({
            where: {},
            orderBy: { criadaEm: 'asc' },
        });
    });

    it('rejects invalid query filter values', async () => {
        await request(app.getHttpServer())
            .get('/tarefas?concluida=maybe')
            .expect(400);

        await request(app.getHttpServer())
            .get('/tarefas?prioridade=XPTO')
            .expect(400);

        await request(app.getHttpServer())
            .get('/tarefas?ordem=qualquer')
            .expect(400);
    });

    it('updates only supplied fields and converts a supplied deadline', async () => {
        prisma.tarefa.findUnique.mockResolvedValue(tarefa);
        prisma.tarefa.update.mockImplementation(async ({ data }) => ({
            ...tarefa,
            ...data,
        }));

        await request(app.getHttpServer())
            .patch('/tarefas/1')
            .send({ concluida: true, prazo: '2026-12-31' })
            .expect(200);

        expect(prisma.tarefa.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                concluida: true,
                prazo: new Date('2026-12-31'),
            },
        });
    });
});
