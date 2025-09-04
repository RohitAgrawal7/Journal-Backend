import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewerService } from './reviewer.service';
import { ReviewerController } from './reviewer.controller';
import { ReviewerApplication } from './reviewer-application.entity';
import { SupabaseService } from 'src/submission/supabase.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ReviewerApplication])],
  providers: [ReviewerService, SupabaseService],
  controllers: [ReviewerController],
})
export class ReviewerModule {}
