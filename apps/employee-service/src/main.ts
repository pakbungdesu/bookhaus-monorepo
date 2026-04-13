import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EmployeeModule } from './employee-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      EmployeeModule,
      {
        transport: Transport.TCP,
        options: {
          host: '0.0.0.0',
          port: 8007,
        },
      },
    );
    await app.listen();
    console.log('Employee Service is listening on port 8007...');
}
bootstrap();
