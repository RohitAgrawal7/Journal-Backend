import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { SubmissionModule } from '../submission/submission.module';

@Module({
  imports: [SubmissionModule],
  controllers: [HealthController],
})
export class HealthModule {}
