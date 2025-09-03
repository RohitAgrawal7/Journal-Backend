import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SupabaseService } from './supabase.service';
import sanitizeFilename from 'sanitize-filename';

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
    let filePath: string | undefined;

    try {
      const sanitizedName = sanitizeFilename(file.originalname);
      filePath = `${Date.now()}_${sanitizedName}`;
      const uploadedPath = await this.supabaseService.uploadFile(
        file,
        filePath,
      );
      const fileUrl = this.supabaseService.getFileUrl(
        'manuscripts',
        uploadedPath,
      );

      const submissionData = {
        ...dto,
        totalAuthors: parseInt(dto.totalAuthors, 10),
        numberOfPages: parseInt(dto.numberOfPages, 10),
        agreeToTerms: dto.agreeToTerms === 'true',
        manuscriptFilePath: fileUrl,
      };

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

  // NEW: Fetch all submissions
  async findAll(): Promise<Submission[]> {
    try {
      const submissions = await this.submissionRepository.find({
        order: { createdAt: 'DESC' }, // Latest first
      });
      this.logger.log(`Fetched ${submissions.length} submissions`);
      return submissions;
    } catch (error) {
      this.logger.error(`Failed to fetch submissions: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch submissions');
    }
  }

  // NEW: Fetch one submission by ID
  async findOne(id: number): Promise<Submission> {
    try {
      const submission = await this.submissionRepository.findOne({
        where: { id },
      });
      if (!submission) {
        throw new NotFoundException(`Submission with ID ${id} not found`);
      }
      this.logger.log(`Fetched submission: ${id}`);
      return submission;
    } catch (error) {
      this.logger.error(`Failed to fetch submission ${id}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch submission ${id}`,
      );
    }
  }

  async findByManuscriptId(
    id: number,
    correspondingAuthorEmail: string,
  ): Promise<Submission> {
    try {
      const submission = await this.submissionRepository.findOne({
        where: { id, correspondingAuthorEmail },
        order: { createdAt: 'DESC' },
      });
      if (!submission) {
        throw new NotFoundException(`Submission with ID ${id} not found`);
      }
      this.logger.log(`Fetched submission for ID: ${id}`);
      return submission;
    } catch (error) {
      this.logger.error(
        `Failed to fetch submission for ID ${id}: ${error.message}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch submission for ID ${id}`,
      );
    }
  }
}
