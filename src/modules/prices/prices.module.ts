import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { Price, PriceSchema } from './entities/price.entity';
import { PriceRepository } from './repositories/price.repository';
import { PricesCron } from './cron/prices.cron';
import { ReeApiProvider } from './providers/ree-api.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Price.name, schema: PriceSchema }]),
    HttpModule,
  ],
  controllers: [PricesController],
  providers: [PricesService, PriceRepository, PricesCron, ReeApiProvider],
  exports: [PricesService, PriceRepository, PricesCron],
})
export class PricesModule { }
