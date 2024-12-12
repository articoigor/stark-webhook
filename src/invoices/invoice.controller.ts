import { Body, Controller, Post, Headers } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Cron } from '@nestjs/schedule';
import { Invoice, Transfer } from 'starkbank';

@Controller()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('/invoice/process')
  processTransfer(
    @Body() body: any,
    @Headers() headers: any,
  ): Promise<Transfer[]> {
    return this.invoiceService.processTransfer(body, headers);
  }
}
