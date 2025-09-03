import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SupabaseService } from './supabase.service';
import sanitizeFilename from 'sanitize-filename'; // Default import (requires tsconfig flag)

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);

  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    private supabaseService: SupabaseService,
  ) {}

  async create(
    dto: CreateSubmissionDto,
    file: Express.Multer.File,
  ): Promise<Submission> {
    let filePath: string | undefined; // Declare outside try for catch access

    try {
      const sanitizedName = sanitizeFilename(file.originalname);
      filePath = `manuscripts/${Date.now()}_${sanitizedName}`;
      await this.supabaseService.uploadFile(file, filePath);
      const fileUrl = this.supabaseService.getFileUrl('manuscripts', filePath);

      const submissionData = {
        ...dto,
        totalAuthors: parseInt(dto.totalAuthors, 10),
        numberOfPages: parseInt(dto.numberOfPages, 10),
        agreeToTerms: dto.agreeToTerms === 'true',
        manuscriptFilePath: fileUrl,
      };

      // Validate parsed values
      if (
        isNaN(submissionData.totalAuthors) ||
        isNaN(submissionData.numberOfPages)
      ) {
        throw new Error(
          'Invalid number format for totalAuthors or numberOfPages',
        );
      }

      const submission = this.submissionRepository.create(submissionData);
      this.logger.log(`Creating submission: ${JSON.stringify(submission)}`);
      return await this.submissionRepository.save(submission);
    } catch (error) {
      this.logger.error(`Submission creation failed: ${error.message}`);
      // Rollback: Delete uploaded file if exists
      if (filePath) {
        await this.supabaseService
          .deleteFile('manuscripts', filePath)
          .catch((deleteError) => {
            this.logger.error(
              `Failed to delete file during rollback: ${deleteError.message}`,
            );
          });
      }
      throw new InternalServerErrorException(
        `Submission failed: ${error.message}`,
      );
    }
  }
}
