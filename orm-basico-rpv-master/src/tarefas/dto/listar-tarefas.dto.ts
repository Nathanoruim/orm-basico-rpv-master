import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { Prioridade } from '../../generated/prisma/enums.js';

export class ListarTarefasDto {
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean()
    concluida?: boolean;

    @IsOptional()
    @IsEnum(Prioridade)
    prioridade?: Prioridade;

    @IsOptional()
    @IsString()
    busca?: string;

    @IsOptional()
    @IsIn(['asc', 'desc'])
    ordem?: 'asc' | 'desc';
}
