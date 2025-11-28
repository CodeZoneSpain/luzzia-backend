import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { CreatePriceDto } from '../dto/create-price.dto';

@Injectable()
export class ReeApiProvider {
    private readonly logger = new Logger(ReeApiProvider.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async fetchPriceData(): Promise<CreatePriceDto[]> {
        const apiUrl =
            this.configService.get<string>('apis.ree.url') ||
            this.configService.get<string>('reeApiUrl');

        if (!apiUrl) {
            throw new Error('REE API URL not configured');
        }

        this.logger.log(`Fetching prices from external API: ${apiUrl}`);

        const { data } = await firstValueFrom(
            this.httpService.get(apiUrl).pipe(
                catchError((error) => {
                    this.logger.error('Error fetching from REE API', error.stack);
                    throw new Error(`REE API error: ${error.message}`);
                }),
            ),
        );

        return this.transformREEData(data);
    }

    private transformREEData(reeData: any): CreatePriceDto[] {
        if (!reeData?.PVPC) {
            throw new Error('Invalid REE API data format');
        }

        const convertDate = (dateStr: string): Date => {
            const [dd, mm, yyyy] = dateStr.split('/');
            return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
        };

        const transformedData = reeData.PVPC.map((item: any) => {
            const date = convertDate(item.Dia);
            const hour = parseInt(item.Hora.split('-')[0], 10);

            const num = parseFloat(item.PCB.replace(',', '.'));
            const price = parseFloat((num / 1000).toFixed(5)); // Convert to €/kWh

            if (!date || isNaN(hour) || isNaN(price)) {
                this.logger.warn(`Invalid data format: ${JSON.stringify(item)}`);
                return null;
            }

            return { date, hour, price };
        }).filter(Boolean);

        return transformedData;
    }
}
