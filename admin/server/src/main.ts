import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true,
  });
  app.use(
    session({
      secret: configService.get('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: configService.get('NODE_ENV') === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(5000);
}
bootstrap();
