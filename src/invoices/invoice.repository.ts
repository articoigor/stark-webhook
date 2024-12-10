import { Injectable } from '@nestjs/common';
import { InvoiceDto } from './dtos/invoice.dto';
import { IInvoiceRepository } from './interfaces/repository.interface';
import { invoice, Invoice, Project, Transfer, transfer } from 'starkbank';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InvoiceRepository implements IInvoiceRepository {
  constructor(private readonly httpService: HttpService) {}
  async publishInvoices(
    invoices: InvoiceDto[],
    adminUser: Project,
  ): Promise<Invoice[]> {
    const dtoToObj = invoices.map(
      (invoice: InvoiceDto): Invoice =>
        new Invoice({
          amount: invoice.amount,
          taxId: invoice.taxId,
          name: invoice.name,
        }),
    );

    return invoice.create(dtoToObj, { user: adminUser });
  }

  async transferAmount(amountValue: number, adminUser: Project) {
    return transfer.create(
      [
        new Transfer({
          amount: amountValue,
          bankCode: '20018183',
          branchCode: '0001',
          accountNumber: '6341320293482496',
          taxId: '20.018.183/0001-80',
          name: 'Stark Bank S.A.',
          accountType: 'payment',
        }),
      ],
      {
        user: adminUser,
      },
    );
  }

  async retrievePublicKey(): Promise<any> {
    const res = await firstValueFrom(
      this.httpService.get('https://sandbox.api.starkbank.com/v2/public-key'),
    );

    if (res) return res.data.publicKeys[0].content;
  }
}
