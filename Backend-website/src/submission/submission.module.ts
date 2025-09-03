import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './submission.entity';
import { SupabaseService } from './supabase.service';
import { ConfigModule } from '@nestjs/config'; // Add this import

@Module({
  imports: [
    ConfigModule, // Import ConfigModule to provide ConfigService
    TypeOrmModule.forFeature([Submission]),
  ],
  providers: [SubmissionService, SupabaseService],
  controllers: [SubmissionController],
})
export class SubmissionModule {}
