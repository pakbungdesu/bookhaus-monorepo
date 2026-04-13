import { NestFactory } from '@nestjs/core';
import { InfoServiceModule } from './info-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      InfoServiceModule,
      {
        transport: Transport.TCP,
        options: {
          host: '0.0.0.0',
          port: 8005,
          serialize: (value) => JSON.stringify(value),
          deserialize: (value) => JSON.parse(value),
        },
      },
    );
    await app.listen();
    console.log('Info Service is listening on port 8005...');
}
bootstrap();
