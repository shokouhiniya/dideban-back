import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transform DTO to plain object
      // whitelist: true, // Strip out properties that are not in the DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap()
  .then(() => {
    console.log('Server is running on http://localhost:3000');
  })
  .catch((err) => {
    console.log('error in running server', err);
  });
