import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from './invoice.repository';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InvoiceDto } from './dtos/invoice.dto';
import { Project, invoice } from 'starkbank';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let repository: jest.Mocked<InvoiceRepository>;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: InvoiceRepository,
          useValue: {
            publishInvoices: jest.fn(),
            retrievePublicKey: jest.fn(),
            transferAmount: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    repository = module.get(InvoiceRepository);
    httpService = module.get(HttpService);
  });

  describe('generateInvoices', () => {
    it('should generate and publish invoices', async () => {
      const mockInvoices: InvoiceDto[] = [
        new InvoiceDto(
          10000,
          'John Doe',
          '2024-12-10T00:00:00.000+00:00',
          2,
          '12345678901',
        ),
      ];
      const mockPublishedInvoices = [];

      repository.publishInvoices.mockResolvedValue(
        mockPublishedInvoices as any,
      );

      const result = await service.generateInvoices();

      expect(repository.publishInvoices).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Project),
      );
      expect(result).toEqual(mockPublishedInvoices);
    });

    it('should throw an error if publishing invoices fails', async () => {
      repository.publishInvoices.mockRejectedValue(new Error('Publish error'));

      await expect(service.generateInvoices()).rejects.toThrow('Publish error');
    });
  });

  describe('processTransfer', () => {
    it('should process a valid transfer', async () => {
      repository.retrievePublicKey.mockResolvedValue('valid-public-key');
      repository.transferAmount.mockResolvedValue([{ id: 'transfer1' }] as any);

      const body = {
        event: {
          subscription: 'invoice',
          log: {
            type: 'credited',
            invoice: {
              amount: 50000,
            },
          },
        },
      };
      const headers = {
        'digital-signature': 'valid-public-key',
      };

      const result = await service.processTransfer(body, headers);

      expect(repository.retrievePublicKey).toHaveBeenCalled();
      expect(repository.transferAmount).toHaveBeenCalledWith(
        50000,
        expect.any(Project),
      );
      expect(result).toEqual([{ id: 'transfer1' }]);
    });

    it('should throw UnauthorizedException if the signature is invalid', async () => {
      repository.retrievePublicKey.mockResolvedValue('invalid-public-key');

      const body = {
        event: {
          subscription: 'invoice',
          log: {
            type: 'credited',
            invoice: {
              amount: 50000,
            },
          },
        },
      };
      const headers = {
        'digital-signature': 'valid-public-key',
      };

      await expect(service.processTransfer(body, headers)).rejects.toThrow(
        'UnauthorizedException: Assinatura digital informada é inválida',
      );
    });

    it('should throw BadRequestException for invalid event type', async () => {
      repository.retrievePublicKey.mockResolvedValue('valid-public-key');

      const body = {
        event: {
          subscription: 'invalid',
          log: {
            type: 'invalid',
          },
        },
      };
      const headers = {
        'digital-signature': 'valid-public-key',
      };

      await expect(service.processTransfer(body, headers)).rejects.toThrow(
        'BadRequestException: O evento recebido não atende ao status/subscrição correto',
      );
    });
  });
});
