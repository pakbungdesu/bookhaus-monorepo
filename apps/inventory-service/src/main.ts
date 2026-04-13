import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { InventoryModule } from './inventory.module'; // Import your actual module

async function bootstrap() {
  // 1. The first argument MUST be your InventoryModule class
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InventoryModule, 
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 8002, 
        serialize: (value) => JSON.stringify(value),
        deserialize: (value) => JSON.parse(value),
      },
    },
  );

  await app.listen();
  console.log('Inventory Service is listening on port 8002...');
}
bootstrap();