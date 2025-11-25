import { ApiProperty } from '@nestjs/swagger';

export class WeeklyDailyAveragesResponseDto {
    @ApiProperty({ description: 'Fecha del dato (YYYY-MM-DD)' })
    date: string;

    @ApiProperty({ description: 'Nombre del día de la semana en español' })
    day: string;

    @ApiProperty({ description: 'Precio promedio del día' })
    averageDay: number;
}
