import { Body, Controller, Post, Headers } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Cron } from '@nestjs/schedule';
import { Invoice, Transfer } from 'starkbank';

@Controller()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Cron('*/15 * * * *')
  generateInvoices(): Promise<Invoice[]> {
    return this.invoiceService.generateInvoices();
  }

  @Post('/invoices/process')
  processTransfer(
    @Body() body: any,
    @Headers() headers: any,
  ): Promise<Transfer[]> {
    return this.invoiceService.processTransfer(body, headers);
  }
}
