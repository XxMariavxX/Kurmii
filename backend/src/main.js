import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { FastifyAdapter } from '@nestjs/platform-fastify';

async function bootstrap() {
  // Створюємо додаток на базі Fastify
  const app = await NestFactory.create(
    AppModule, 
    new FastifyAdapter({ logger: true })
  );

  // Вмикаємо CORS, щоб React (порт 5173) міг достукатися до API (порт 8000)
  app.enableCors();

  // Для Fastify важливо явно вказати '0.0.0.0' для прослуховування всіх адрес
  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`Server is running on: http://localhost:${port}`);
}
bootstrap();
