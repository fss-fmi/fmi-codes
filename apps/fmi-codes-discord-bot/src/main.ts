import {AppModule} from './app/app.module';
import {NestFactory} from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.init();
}

bootstrap();
