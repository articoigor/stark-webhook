import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { InvoiceService } from 'src/invoices/invoice.service';

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const service = appContext.get(InvoiceService);

  const response = service.functionsHealthcheck();

  context.res = {
    status: 200,
    body: response,
  };
};

export default httpTrigger;
