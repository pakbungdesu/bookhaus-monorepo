import { NestFactory } from '@nestjs/core';
import { OrderModule } from './order.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 8003, // Different port for each service
        serialize: (value) => JSON.stringify(value),
        deserialize: (value) => JSON.parse(value),
      },
    },
  );
  await app.listen();
  console.log('Order Service is listening on port 8003...');
}
bootstrap();
