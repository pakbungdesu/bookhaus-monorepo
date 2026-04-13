import { NestFactory } from '@nestjs/core';
import { CustomerModule } from './customer-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CustomerModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 8004,
      },
    },
  );
  await app.listen();
  console.log('Customer Service is listening on port 8004...');
}
bootstrap();
