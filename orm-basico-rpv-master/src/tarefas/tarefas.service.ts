import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CriarTarefaDto } from './dto/criar-tarefa.dto.js';
import { AtualizarTarefaDto } from './dto/atualizar-tarefa.dto.js';
import { ListarTarefasDto } from './dto/listar-tarefas.dto.js';

@Injectable()
export class TarefasService {
    constructor(private readonly prisma: PrismaService) {}

    criar(dto: CriarTarefaDto) {
        const { prazo, ...dados } = dto;

        return this.prisma.tarefa.create({
            data: {
                ...dados,
                prazo: prazo == null ? null : new Date(prazo),
            },
        });
    }

    listar(dto: ListarTarefasDto) {
        const where: Prisma.TarefaWhereInput = {};

        if (dto.concluida !== undefined) {
            where.concluida = dto.concluida;
        }

        if (dto.prioridade !== undefined) {
            where.prioridade = dto.prioridade;
        }

        const busca = dto.busca?.trim();
        if (busca) {
            where.titulo = { contains: busca };
        }

        return this.prisma.tarefa.findMany({
            where,
            orderBy: { criadaEm: dto.ordem ?? 'asc' },
        });
    }

    async buscar(id: number) {
        const tarefa = await this.prisma.tarefa.findUnique({
            where: { id },
        });

        if (!tarefa) {
            throw new NotFoundException(`Tarefa ${id} não encontrada`);
        }

        return tarefa;
    }

    async atualizar(id: number, dto: AtualizarTarefaDto) {
        await this.buscar(id);

        const { prazo, ...dados } = dto;
        return this.prisma.tarefa.update({
            where: { id },
            data: {
                ...dados,
                ...(prazo !== undefined && {
                    prazo: prazo === null ? null : new Date(prazo),
                }),
            },
        });
    }

    async remover(id: number) {
        await this.buscar(id);
        return this.prisma.tarefa.delete({ where: { id } });
    }
}
