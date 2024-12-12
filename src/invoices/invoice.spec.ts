import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from './invoice.repository';
import { Invoice, Project } from 'starkbank';
import { HttpException } from '@nestjs/common';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let repository: jest.Mocked<InvoiceRepository>;

  beforeEach(async () => {
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
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    repository = module.get(InvoiceRepository);
  });

  describe('generateInvoices', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = {
        ...originalEnv,
        PRIV_KEY_VAL: `-----BEGIN EC PARAMETERS-----
BgUrgQQACg==
-----END EC PARAMETERS-----
-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIPnPOV646E95kegnLrGh2BJhVCk4pbl+1fBZhpsEFZN+oAcGBSuBBAAK
oUQDQgAECim3XK8W5wRJNgxUQg/7jMnX+6YdsTU2uvtq7SyznO4fhpZo4YRwwajT
D1sbfRM9KYy+WOBCSZiDfT5CUrQY8Q==
-----END EC PRIVATE KEY-----
`,
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should generate and publish invoices', async () => {
      const mockInvoices: Invoice[] = [
        new Invoice({
          amount: 10000,
          taxId: '09.435.60-78',
          name: 'John Doe',
        }),
      ];

      repository.publishInvoices.mockResolvedValue(mockInvoices as any);

      const result = await service.generateInvoices();

      expect(repository.publishInvoices).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Project),
      );
      expect(result).toEqual({ error: null, invoices: mockInvoices });
    });

    it('should throw an error if publishing invoices fails', async () => {
      repository.publishInvoices.mockRejectedValue(new Error('Publish error'));

      expect(service.generateInvoices()).resolves.toEqual({
        error: new HttpException('Publish error', 400),
        invoices: null,
      });
    });
  });

  describe('processTransfer', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = {
        ...originalEnv,
        PRIV_KEY_VAL: `-----BEGIN EC PARAMETERS-----
BgUrgQQACg==
-----END EC PARAMETERS-----
-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIPnPOV646E95kegnLrGh2BJhVCk4pbl+1fBZhpsEFZN+oAcGBSuBBAAK
oUQDQgAECim3XK8W5wRJNgxUQg/7jMnX+6YdsTU2uvtq7SyznO4fhpZo4YRwwajT
D1sbfRM9KYy+WOBCSZiDfT5CUrQY8Q==
-----END EC PRIVATE KEY-----
`,
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

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
      expect(result).toEqual({ error: null, transfer: { id: 'transfer1' } });
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

      expect(service.processTransfer(body, headers)).resolves.toEqual({
        error: new HttpException(
          'Assinatura digital informada é inválida',
          400,
        ),
        transfer: null,
      });
    });
  });
});
