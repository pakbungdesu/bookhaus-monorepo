import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GatewayModule } from './gateway.module';
import { ViewExceptionFilter } from '../../../filters/view-exception.filter';
import { join } from 'path';
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import { createProxyMiddleware } from 'http-proxy-middleware';

const cookieParser = require('cookie-parser');
const session = require('express-session');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(GatewayModule);

  // Register the filter globally
  //app.useGlobalFilters(new ViewExceptionFilter());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Strips away properties not in the DTO
    forbidNonWhitelisted: true, // Throws error if extra properties are sent
    transform: true,        // Automatically transforms types
  }));

  // Redis Client Setup
  const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
  const redisClient = createClient({ url: redisUrl });
  redisClient.connect().catch((err) => console.error('❌ Redis Error:', err));

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "bookhaus_sess:",
  });

  app.use(
    '/recommend',
    createProxyMiddleware({
      target: 'http://recommender-service:8000', // Points to your NestJS bridge
      changeOrigin: true,
      pathRewrite: {
        '^/recommend': '/recommend', // Ensure this maps correctly
      },
    }),
  );

  // Middleware
  app.use(cookieParser());
  
  app.use(
    session({
      store: redisStore,
      secret: process.env.SESSION_SECRET || 'bookhaus_super_secret_key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24,
      },
    }),
  );

  const rootPath = process.cwd();
  
  app.useStaticAssets(join(rootPath, 'public'));
  app.setBaseViewsDir(join(rootPath, 'views'));
  app.setViewEngine('ejs');

  await app.listen(3000);
  console.log('🚀 Gateway is live at http://localhost:3001');
}
bootstrap();
