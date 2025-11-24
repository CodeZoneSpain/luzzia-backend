import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PricesService } from './prices.service';
import { Price } from './entities/price.entity';
import { PriceRepository } from './repositories/price.repository';

describe('PricesService - Weekly Daily Averages', () => {
    let service: PricesService;
    let priceModel: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PricesService,
                {
                    provide: getModelToken(Price.name),
                    useValue: {
                        aggregate: jest.fn(),
                    },
                },
                {
                    provide: HttpService,
                    useValue: {},
                },
                {
                    provide: ConfigService,
                    useValue: {},
                },
                {
                    provide: PriceRepository,
                    useValue: {},
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<PricesService>(PricesService);
        priceModel = module.get(getModelToken(Price.name));
    });

    describe('getWeeklyDailyAverages', () => {
        it('should return daily averages for the week up to the target date (Friday)', async () => {
            // Target: Friday 2023-11-24
            const targetDateStr = '2023-11-24';

            // Mock aggregate result
            // Monday 20th to Friday 24th
            const mockAggregateResult = [
                { _id: '2023-11-20', avgPrice: 0.10 }, // Mon
                { _id: '2023-11-21', avgPrice: 0.11 }, // Tue
                { _id: '2023-11-22', avgPrice: 0.12 }, // Wed
                { _id: '2023-11-23', avgPrice: 0.13 }, // Thu
                { _id: '2023-11-24', avgPrice: 0.14 }, // Fri
            ];

            jest.spyOn(priceModel, 'aggregate').mockResolvedValue(mockAggregateResult);

            const result = await service.getWeeklyDailyAverages(targetDateStr);

            expect(priceModel.aggregate).toHaveBeenCalledWith([
                {
                    $match: {
                        date: {
                            $gte: expect.any(Date), // Monday
                            $lt: expect.any(Date),  // Saturday (next day of target)
                        },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                        avgPrice: { $avg: '$price' },
                    },
                },
                { $sort: { _id: 1 } },
            ]);

            expect(result).toHaveLength(5);
            expect(result[0]).toEqual({ fecha: '2023-11-20', dia: 'Lunes', promedio: 0.10 });
            expect(result[4]).toEqual({ fecha: '2023-11-24', dia: 'Viernes', promedio: 0.14 });
        });

        it('should return daily averages for the week up to the target date (Wednesday)', async () => {
            // Target: Wednesday 2023-11-22
            const targetDateStr = '2023-11-22';

            const mockAggregateResult = [
                { _id: '2023-11-20', avgPrice: 0.10 }, // Mon
                { _id: '2023-11-21', avgPrice: 0.11 }, // Tue
                { _id: '2023-11-22', avgPrice: 0.12 }, // Wed
            ];

            jest.spyOn(priceModel, 'aggregate').mockResolvedValue(mockAggregateResult);

            const result = await service.getWeeklyDailyAverages(targetDateStr);

            expect(result).toHaveLength(3);
            expect(result[0].dia).toBe('Lunes');
            expect(result[2].dia).toBe('Miércoles');
        });

        it('should handle missing data by returning 0', async () => {
            // Target: Tuesday 2023-11-21
            const targetDateStr = '2023-11-21';

            // Only Monday has data
            const mockAggregateResult = [
                { _id: '2023-11-20', avgPrice: 0.10 },
            ];

            jest.spyOn(priceModel, 'aggregate').mockResolvedValue(mockAggregateResult);

            const result = await service.getWeeklyDailyAverages(targetDateStr);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ fecha: '2023-11-20', dia: 'Lunes', promedio: 0.10 });
            expect(result[1]).toEqual({ fecha: '2023-11-21', dia: 'Martes', promedio: 0 });
        });
    });
});
