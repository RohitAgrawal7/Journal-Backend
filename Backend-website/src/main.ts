import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Build CORS allowlist from env or fall back to sensible defaults
  const envOrigins = (process.env.FRONTEND_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  const regexes = [/\.railway\.app$/, /\.vercel\.app$/];

  const allowlist = [...defaultOrigins, ...envOrigins];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin)
      if (!origin) return callback(null, true);
      if (allowlist.includes(origin) || regexes.some((r) => r.test(origin))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }); // For frontend
  
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port}`);
}
bootstrap();
