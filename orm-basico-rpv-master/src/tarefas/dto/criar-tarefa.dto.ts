import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Prioridade } from '../../generated/prisma/enums.js';

export class CriarTarefaDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(191)
    titulo: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    descricao?: string | null;

    @IsOptional()
    @IsISO8601({ strict: true, strictSeparator: true })
    prazo?: string | null;

    @IsOptional()
    @IsEnum(Prioridade)
    prioridade?: Prioridade;
}