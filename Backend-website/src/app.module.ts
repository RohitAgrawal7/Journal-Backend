import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { SubmissionModule } from './submission/submission.module';
import { TypeOrmConfigService } from './type-orm-config.service';
import { StudentModule } from './student/student.module';
import { ReviewerModule } from './reviewer/reviewer.module';
// import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        PORT: Joi.number().default(3000),
        // Database
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        // SMTP
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().default(587),
        SMTP_USER: Joi.string().required(),
        SMTP_PASSWORD: Joi.string().required(),
        SMTP_FROM: Joi.string().required(),
        // Supabase
        SUPABASE_URL: Joi.string().uri().required(),
        SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
        // Frontend CORS (comma-separated origins)
        FRONTEND_ORIGINS: Joi.string().optional().allow(''),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    SubmissionModule,
    StudentModule,
    ReviewerModule,
    // EmailService,
  EmailModule,
  HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer) {
    consumer
      .apply(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
      )
      .forRoutes('*'); // Global validation
  }
}
