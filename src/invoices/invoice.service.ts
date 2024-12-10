import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceDto } from './dtos/invoice.dto';
import { IInvoiceService } from './interfaces/service.interface';
import { CustomerDto } from './dtos/customer.dto';
import { CustomerHelper as helper } from './helpers/customer.helper';
import { Invoice, Project, Transfer, event } from 'starkbank';

@Injectable()
export class InvoiceService implements IInvoiceService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async generateInvoices(): Promise<Invoice[]> {
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
      console.log(invoices);
      const admin = new Project({
        environment: 'sandbox',
        id: '4884995034316800',
        privateKey: `-----BEGIN EC PARAMETERS-----
BgUrgQQACg==
-----END EC PARAMETERS-----
-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIPnPOV646E95kegnLrGh2BJhVCk4pbl+1fBZhpsEFZN+oAcGBSuBBAAK
oUQDQgAECim3XK8W5wRJNgxUQg/7jMnX+6YdsTU2uvtq7SyznO4fhpZo4YRwwajT
D1sbfRM9KYy+WOBCSZiDfT5CUrQY8Q==
-----END EC PRIVATE KEY-----`,
      });
      console.log(admin);
      return this.invoiceRepository.publishInvoices(invoices, admin);
    } catch (e) {
      throw new Error(e);
    }
  }

  async processTransfer(body: any, headers: any): Promise<Transfer[]> {
    try {
      const starkKey = await this.invoiceRepository.retrievePublicKey();
      console.log(starkKey);
      if (headers['Digital-Signature'] !== starkKey)
        throw new UnauthorizedException(
          'Assinatura digital informada é inválida',
        );

      const rawEvent: any = await event.parse({
        content: JSON.stringify(body),
        signature: headers['Digital-Signature'],
      });

      if (
        rawEvent.subscription === 'invoice' &&
        rawEvent.log.type == 'credited'
      ) {
        const admin = new Project({
          environment: 'sandbox',
          id: '4884995034316800',
          privateKey: `-----BEGIN EC PARAMETERS-----
BgUrgQQACg==
-----END EC PARAMETERS-----
-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIPnPOV646E95kegnLrGh2BJhVCk4pbl+1fBZhpsEFZN+oAcGBSuBBAAK
oUQDQgAECim3XK8W5wRJNgxUQg/7jMnX+6YdsTU2uvtq7SyznO4fhpZo4YRwwajT
D1sbfRM9KYy+WOBCSZiDfT5CUrQY8Q==
-----END EC PRIVATE KEY-----`,
        });

        return this.invoiceRepository.transferAmount(
          rawEvent.log.invoice?.nominalAmount,
          admin,
        );
      }
    } catch (e) {
      throw new Error(e);
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
