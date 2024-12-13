import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceDto } from './dtos/invoice.dto';
import { IInvoiceService } from './interfaces/service.interface';
import { CustomerDto } from './dtos/customer.dto';
import { CustomerHelper as helper } from './helpers/customer.helper';
import { Project, invoice } from 'starkbank';
import { ProcessTransferResponse } from './interfaces/processInvoice.response';
import { GenerateInvoiceResponse } from './interfaces/generateInvoices.response';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';

@Injectable()
export class InvoiceService implements IInvoiceService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  private readonly containerClient = this.generateContainerClient();

  private readonly logger = new Logger(InvoiceService.name);

  functionsHealthcheck(): any {
    return {
      status: 200,
      message: 'The azure functions are healthy',
    };
  }

  async generateInvoices(): Promise<GenerateInvoiceResponse> {
    this.logger.log(
      'InvoiceService (generateInvoices): STARTED GENERATING MOCK INVOICES',
    );

    try {
      let count = Math.floor(Math.random() * (12 - 8) + 8);

      const invoices: InvoiceDto[] = [];

      const customers: CustomerDto[] = [];

      while (count-- > 0) {
        const customer = this.createCustomer();

        customers.push(customer);

        const invoice = this.createInvoice(customer);

        invoices.push(invoice);
      }

      const privKey = process.env.PRIV_KEY_VAL;

      const admin = new Project({
        environment: 'sandbox',
        id: '4884995034316800',
        privateKey: privKey,
      });

      const res = await this.invoiceRepository.publishInvoices(invoices, admin);

      this.logger.log(
        'InvoiceService (generateInvoices): GENERATED MOCKS SUCESSFULLY',
      );

      return new GenerateInvoiceResponse(res, null);
    } catch (e) {
      this.logger.log(
        'InvoiceService ERR (generateInvoices): PROBLEM WHILE GENERATING MOCK INVOICES',
      );

      return new GenerateInvoiceResponse(
        null,
        new HttpException(e.message, 500),
      );
    }
  }

  async processTransfer(
    body: any,
    headers: any,
  ): Promise<ProcessTransferResponse> {
    this.logger.log(
      'InvoiceService (processTransfer): STARTED PROCESSING EVENT',
    );

    await this.saveToLogFile(body, 'body');

    try {
      const starkKey = await this.invoiceRepository.retrievePublicKey();

      const headersKey = this.formatHeaders(headers);

      const isValidKey = this.validateHeaders(headersKey, starkKey);

      if (!headersKey || !isValidKey)
        return new ProcessTransferResponse(
          null,
          new HttpException('Assinatura digital informada é inválida', 400),
        );

      if (!body || !body.event)
        return new ProcessTransferResponse(
          null,
          new HttpException(
            'O preenchimento do body com os dados do invoice event é obrigatório',
            400,
          ),
        );

      const rawEvent = body.event;

      if (
        rawEvent.subscription == 'invoice' &&
        rawEvent.log.type == 'credited'
      ) {
        const privKey = process.env.PRIV_KEY_VAL;

        const admin = new Project({
          environment: 'sandbox',
          name: 'StarkInvoiceManagement',
          id: '4884995034316800',
          privateKey: privKey,
        });

        const log: invoice.Log | any = rawEvent.log;

        const res = await this.invoiceRepository.transferAmount(
          log.invoice.amount,
          admin,
        );

        await this.saveToLogFile(JSON.stringify(res), 'response');

        this.logger.log(
          'InvoiceService (processTransfer): PROCESSED TRANSFER EVENT SUCCESSFULLY',
        );

        return new ProcessTransferResponse(res[0], null);
      }
    } catch (e) {
      return new ProcessTransferResponse(
        null,
        new HttpException(e.message, 500),
      );
    }
  }

  private generateContainerClient() {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      'DefaultEndpointsProtocol=https;AccountName=starkevents;AccountKey=0aMF7Du1Thfo33Zxk3JQSJg9jwvZsUeEWHaHcSNpXB0qvAaeN/9DdXm80flTBx7mJ3JjFKTcSJcn+ASt3C6igg==;EndpointSuffix=core.windows.net',
    );

    return blobServiceClient.getContainerClient('invoice-logs');
  }

  async saveToLogFile(content: string, name: string) {
    const today = new Date();

    const fileName = `log-invoice-process-${name}-${today.getMilliseconds()}.txt`;

    const blockBlobClient: BlockBlobClient =
      this.containerClient.getBlockBlobClient(fileName);

    const uploadBlobResponse = await blockBlobClient.uploadData(
      Buffer.from(JSON.stringify(content), 'utf-8'),
    );

    return uploadBlobResponse.requestId;
  }

  private createInvoice(customer: CustomerDto): InvoiceDto {
    const date = new Date();

    const amount = this.generateInvoiceValue();

    date.setDate(date.getDate() + Math.floor(Math.random() * 7) + 1);

    return new InvoiceDto(
      amount,
      customer.name,
      date.toISOString().replace(/\.\d{3}Z$/, '.000+00:00'),
      2,
      customer.taxId,
    );
  }

  private validateHeaders(headersKey: string, pbKey: string) {
    return pbKey.trim() == headersKey.trim();
  }
  private formatHeaders(headers: any): string {
    const headerFlag = headers['digital-signature'];

    return headerFlag ? headerFlag.replace(/\\\\n/g, '\n') : '';
  }

  private generateInvoiceValue(): number {
    const val = Math.random() * (50000 - 1);

    return Number(val.toFixed(2).replace('.', ''));
  }

  private createCustomer(): CustomerDto {
    const customer = helper.generateMockData();

    return new CustomerDto(
      customer.name,
      customer.cpf,
      customer.email,
      '',
      '',
      '',
      '',
      '',
      '',
    );
  }
}
