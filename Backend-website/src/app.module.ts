import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SubmissionModule } from './submission/submission.module';
import { TypeOrmConfigService } from './type-orm-config.service';
import { StudentModule } from './student/student.module';
import { ReviewerModule } from './reviewer/reviewer.module';
// import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
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
