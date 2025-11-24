import { ApiProperty } from '@nestjs/swagger';

export class WeeklyDailyAveragesResponseDto {
    @ApiProperty({ description: 'Fecha del dato (YYYY-MM-DD)' })
    fecha: string;

    @ApiProperty({ description: 'Nombre del día de la semana en español' })
    dia: string;

    @ApiProperty({ description: 'Precio promedio del día' })
    promedio: number;
}
