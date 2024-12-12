import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { HttpModule } from '@nestjs/axios';
import { InvoiceRepository } from './invoice.repository';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [InvoiceService, InvoiceRepository],
})
export class InvoiceModule {}
