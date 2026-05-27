import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './email.service';
import { join } from 'path';
import { Logger } from '@nestjs/common';

const logger = new Logger('EmailModule');

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const smtpHost = config.get('SMTP_HOST');
        const smtpPort = config.get<number>('SMTP_PORT');
        const smtpUser = config.get('SMTP_USER');
        const smtpPass = config.get('SMTP_PASSWORD') ? '***' : undefined;
        const smtpFromEmail = config.get('SMTP_FROM');

        logger.log(`SMTP_HOST: ${smtpHost}`);
        logger.log(`SMTP_PORT: ${smtpPort}`);
        logger.log(`SMTP_USER: ${smtpUser}`);
        logger.log(`SMTP_PASSWORD: ${smtpPass ? 'Provided' : 'Not Provided'}`);
        logger.log(`SMTP_FROM: ${smtpFromEmail}`);
        logger.log(`Templates directory: ${join(__dirname, 'templates')}`);

        return {
          transport: {
            host: smtpHost,
            port: smtpPort,
            secure: false,
            auth: {
              user: smtpUser,
              pass: config.get('SMTP_PASSWORD'),
            },
            connectionTimeout: 300000, // 5 min
            greetingTimeout: 300000,
            socketTimeout: 300000,
          },
          defaults: {
            from: `"UJGSM" <${smtpFromEmail}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
