import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceDto } from './dtos/invoice.dto';
import { IInvoiceService } from './interfaces/service.interface';
import { CustomerDto } from './dtos/customer.dto';
import { CustomerHelper as helper } from './helpers/customer.helper';
import { Invoice, Project, Transfer, invoice } from 'starkbank';

@Injectable()
export class InvoiceService implements IInvoiceService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  private readonly logger = new Logger(InvoiceService.name);

  async generateInvoices(): Promise<Invoice[]> {
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

      return res;
    } catch (e) {
      this.logger.log(
        'InvoiceService ERR (generateInvoices): PROBLEM WHILE GENERATING MOCK INVOICES',
      );

      const error = e.toString();

      if (error.includes('Repository')) {
        const message = error.split(':')[1].trim();

        throw new InternalServerErrorException(message);
      }

      throw e;
    }
  }

  async processTransfer(body: any, headers: any): Promise<Transfer[]> {
    this.logger.log(
      'InvoiceService (processTransfer): STARTED PROCESSING EVENT',
    );

    try {
      const starkKey = await this.invoiceRepository.retrievePublicKey();

      const headersKey = this.formatHeaders(headers);

      const isValidKey = this.validateHeaders(headersKey, starkKey);

      if (!isValidKey)
        throw new UnauthorizedException(
          'Assinatura digital informada é inválida',
        );

      const rawEvent = body.event;

      if (
        rawEvent.subscription == 'invoice' ||
        rawEvent.log.type == 'credited'
      ) {
        const privKey = process.env.PRIV_KEY_VAL;

        const admin = new Project({
          environment: 'sandbox',
          id: '4884995034316800',
          privateKey: privKey,
        });

        const log: invoice.Log | any = rawEvent.log;

        const res = await this.invoiceRepository.transferAmount(
          log.invoice.amount,
          admin,
        );

        this.logger.log(
          'InvoiceService (processTransfer): PROCESSED TRANSFER EVENT SUCCESSFULLY',
        );

        return res;
      }
    } catch (e) {
      this.logger.log(
        'InvoiceService ERR (processTransfer): PROBLEM WHILE PROCESSING AMOUNT TRANSFER',
      );

      const error = e.toString();

      if (error.includes('Repository')) {
        const message = error.split(':')[1].trim();

        throw new InternalServerErrorException(message);
      }

      throw e;
    }
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
    return headers['digital-signature'].replace(/\\\\n/g, '\n');
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
