import { generate } from 'gerador-validador-cpf';

const firstNames = [
  'Igor',
  'João',
  'Maria',
  'Carlos',
  'Gabriela',
  'Fernanda',
  'Luísa',
  'Camila',
];

const lastNames = [
  'Artico',
  'Santos',
  'Oliveira',
  'Janjacomo',
  'Silva',
  'Costa',
  'Nunes',
  'Redivo',
  'Souza',
];

export class CustomerHelper {
  static generateMockData(): any {
    const randomFirstName =
      firstNames[Math.floor(Math.random() * firstNames.length)];

    const randomLastName =
      lastNames[Math.floor(Math.random() * lastNames.length)];

    const name = `${randomFirstName} ${randomLastName}`;

    const email = `${randomFirstName.toLowerCase()}_${randomLastName.toLowerCase()}@stark.com`;

    return {
      name: name,
      email: email,
      cpf: this.generateCpf(),
    };
  }

  static generateCpf() {
    return generate({ format: true });
  }
}
