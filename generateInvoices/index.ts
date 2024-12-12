import { Context } from '@azure/functions';
import { NestFactory } from '@nestjs/core';
import { InvoiceController } from 'src/invoices/invoice.controller';
import { InvoiceService } from 'src/invoices/invoice.service';
import { createApp } from 'src/main.azure';

export default async function (context: Context): Promise<void> {
  try {
    const app = await NestFactory.create(createApp());

    const invoiceService = app.get(InvoiceService);

    await invoiceService.generateInvoices();

    context.log('Time-triggered function executed and invoice method called');

    await app.close();
  } catch (e) {
    context.log(e);
  }
}
