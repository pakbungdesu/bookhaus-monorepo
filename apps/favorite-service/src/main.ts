import { NestFactory } from '@nestjs/core';
import { FavoriteModule } from './favorite-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FavoriteModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 8006,
      },
    },
  );
  await app.listen();
  console.log('Favorite Service is listening on port 8006...');
}
bootstrap();

