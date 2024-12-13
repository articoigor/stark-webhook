import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import * as appInsights from 'applicationinsights';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appInsights
    .setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
    .setAutoCollectRequests(true)
    .setAutoCollectDependencies(true)
    .setAutoDependencyCorrelation(true)
    .start();

  ConfigModule.forRoot();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
