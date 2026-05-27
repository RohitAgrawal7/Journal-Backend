import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './submission.entity';
import { SupabaseService } from './supabase.service';
import { ConfigModule } from '@nestjs/config'; // Add this import
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    ConfigModule, // Import ConfigModule to provide ConfigService
    EmailModule,
    TypeOrmModule.forFeature([Submission]),
  ],
  providers: [SubmissionService, SupabaseService],
  exports: [SupabaseService],
  controllers: [SubmissionController],
})
export class SubmissionModule {}
