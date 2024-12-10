import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { InvoiceModule } from './invoices/invoice.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [InvoiceModule, HttpModule, ScheduleModule.forRoot()],
})
export class AppModule {}
