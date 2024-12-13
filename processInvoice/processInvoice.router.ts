import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { InvoiceService } from 'src/invoices/invoice.service';

const httpTrigger: AzureFunction = async (
  context: Context,
  req: HttpRequest,
): Promise<void> => {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const service = appContext.get(InvoiceService);

  const result = await service.processTransfer(req.body, req.headers);

  context.res = {
    status: !result.error ? 200 : result.error.getStatus(),
    body: result,
  };
};

export default httpTrigger;
