import { Body, Controller, Post, Headers, Get } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Cron } from '@nestjs/schedule';
import { Invoice, Transfer } from 'starkbank';

@Controller()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('healtcheck')
  functionsHealthcheck() {
    return 'The app is running normally';
  }

  @Post('/invoice/process')
  processTransfer(
    @Body() body: any,
    @Headers() headers: any,
  ): Promise<Transfer[]> {
    return this.invoiceService.processTransfer(body, headers);
  }
}
