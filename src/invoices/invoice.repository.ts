import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InvoiceDto } from './dtos/invoice.dto';
import { IInvoiceRepository } from './interfaces/repository.interface';
import { invoice, Invoice, Project, Transfer, transfer } from 'starkbank';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RepositoryException } from './interfaces/repository.exception';

@Injectable()
export class InvoiceRepository implements IInvoiceRepository {
  constructor(private readonly httpService: HttpService) {}
  async publishInvoices(
    invoices: InvoiceDto[],
    adminUser: Project,
  ): Promise<Invoice[]> {
    try {
      const dtoToObj = invoices.map(
        (invoice: InvoiceDto): Invoice =>
          new Invoice({
            amount: invoice.amount,
            taxId: invoice.taxId,
            name: invoice.name,
          }),
      );

      return invoice.create(dtoToObj, { user: adminUser });
    } catch (e) {
      throw new InternalServerErrorException(
        'Houve um erro ao tentar publicar os invoices gerados',
      );
    }
  }

  async transferAmount(amountValue: number, adminUser: Project) {
    try {
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
    } catch (e) {
      throw new RepositoryException(
        'Houve um erro ao tentar transferir os fundos',
        e,
      );
    }
  }

  async retrievePublicKey(): Promise<any> {
    try {
      const res = await firstValueFrom(
        this.httpService.get('https://sandbox.api.starkbank.com/v2/public-key'),
      );

      if (res) return res.data.publicKeys[0].content;
    } catch (e) {
      throw new RepositoryException(
        'Houve um erro ao tentar recuperar a chave pública',
        e,
      );
    }
  }
}
