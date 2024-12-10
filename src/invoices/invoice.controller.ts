import { Body, Controller, Post, Headers } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Cron } from '@nestjs/schedule';
import { Invoice, Transfer } from 'starkbank';

@Controller()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Cron('0 */3 * * *')
  generateInvoices(): Promise<Invoice[]> {
    return this.invoiceService.generateInvoices();
  }

  @Post()
  processTransfer(
    @Body() body: any,
    @Headers() headers: any,
  ): Promise<Transfer[]> {
    return this.invoiceService.processTransfer(body, headers);
  }
}
