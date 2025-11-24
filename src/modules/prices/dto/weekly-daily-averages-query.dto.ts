import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class WeeklyDailyAveragesQueryDto {
    @ApiPropertyOptional({
        description: 'Fecha de consulta (YYYY-MM-DD). Si no se envía, se usa la fecha actual.',
        example: '2023-11-24',
    })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'La fecha debe tener el formato YYYY-MM-DD',
    })
    date?: string;
}
