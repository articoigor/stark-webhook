# STARK BANK - Invoice GENERATOR / PROCESSOR

Este projeto é uma aplicação backend e também parte do processo seletivo para vaga de Desenvolvedor Backend e foi construído com NestJS, implementando Azure Functions para processar eventos recebidos via webhook e gerar invoices mockados.

## Funcionalidades Principais

- Webhook para processamento de pagamento de invoices.
- Function do tipo TimeTrigger para geração e publicação de invoices mockados.
- Endpoint para verificação de healtcheck do serviço.
- Logs dos eventos para o endpoint de processamento.

## Estrutura do Projeto

- **NestJS**: Framework backend para estruturação modular e escalável.
- **Azure Functions**: Plataforma serverless para hospedagem e execução do webhook.
- **Blob Storage**: Plataforma para armazenamento de logs contendo requests e responses.

## Como Rodar Localmente

1. **Pré-requisitos**:

   - Node.js instalado.
   - Azure Functions Core Tools instalado.
   - Azure CLI (opcional, para deploy).
   - Azurite (Simulador de armazenamento).
   - Criação do arquivo .env na raiz do diretório **src** (Para saber o conteúdo, solicitar através do email)

2. **Instalar e executar a Azurite**
   Em um diretório à parte, basta executar os seguintes comandos:

   ```bash
   npm install azurite && azurite
   ```

3. **Instalar Dependências**:

   ```bash
   npm install
   ```

4. **Executar o comando de start**

   ```bash
   npm run start
   ```

   **Pronto, a aplicação já estará rodando !**
