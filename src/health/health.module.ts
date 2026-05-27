import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { SubmissionModule } from '../submission/submission.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [SubmissionModule, EmailModule],
  controllers: [HealthController],
})
export class HealthModule {}
