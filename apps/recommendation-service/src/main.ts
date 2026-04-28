import { NestFactory } from '@nestjs/core';
import { RecommendationModule } from './recommendation.module';

async function bootstrap() {
  const app = await NestFactory.create(RecommendationModule);
  await app.listen(8000, '0.0.0.0');
}
bootstrap();
