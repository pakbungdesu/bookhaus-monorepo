import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 8001, // Different port for each service
        serialize: (value) => JSON.stringify(value),
        deserialize: (value) => JSON.parse(value),
      },
    },
  );
  await app.listen();
  console.log('Auth Service is listening on port 8001...');
}
bootstrap();
