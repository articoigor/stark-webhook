import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { HttpModule } from '@nestjs/axios';
import { InvoiceRepository } from './invoice.repository';

@Module({
  imports: [HttpModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceRepository],
})
export class InvoiceModule {}