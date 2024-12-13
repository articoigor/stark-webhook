export class RepositoryException extends Error {
  constructor(
    message: string,
    public originalError?: any,
  ) {
    super(message);
    this.name = 'RepositoryException';
  }
}
