import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { InvoiceModule } from './invoices/invoice.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    InvoiceModule,
    HttpModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
