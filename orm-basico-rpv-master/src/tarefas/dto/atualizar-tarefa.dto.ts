import { Prioridade } from '../../generated/prisma/enums.js';
import {
    IsBoolean,
    IsEnum,
    IsISO8601,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    ValidateIf,
} from 'class-validator';

export class AtualizarTarefaDto {
    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    @IsNotEmpty()
    @MaxLength(191)
    titulo?: string;

    @ValidateIf((_object, value) => value !== undefined)
    @IsBoolean()
    concluida?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    descricao?: string | null;

    @IsOptional()
    @IsISO8601({ strict: true, strictSeparator: true })
    prazo?: string | null;

    @ValidateIf((_object, value) => value !== undefined)
    @IsEnum(Prioridade)
    prioridade?: Prioridade;
}