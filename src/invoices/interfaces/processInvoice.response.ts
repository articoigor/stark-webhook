import { HttpException } from '@nestjs/common';
import { Transfer } from 'starkbank';

export class ProcessTransferResponse {
  transfer: Transfer;
  error?: HttpException;

  constructor(transfer: Transfer, error?: HttpException) {
    this.transfer = transfer;
    this.error = error;
  }
}
