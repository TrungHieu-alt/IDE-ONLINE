import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getEnv } from './config/env';

async function bootstrap() {
  const env = getEnv();
  const app = await NestFactory.create(AppModule);
  await app.listen(env.port);
}
bootstrap();
