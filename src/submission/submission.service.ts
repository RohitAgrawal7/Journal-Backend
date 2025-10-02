import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Submission, SubmissionStatus } from './submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SupabaseService } from './supabase.service';
import sanitizeFilename from 'sanitize-filename';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../email/email.service'; // Add this import

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);

  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    private supabaseService: SupabaseService,
    @Inject(EmailService) // Add this decorator
    private emailService: EmailService,
  ) {
    // Test if emailService is available
    if (!this.emailService) {
      throw new Error('EmailService is not properly injected');
    }
    this.logger.log('EmailService injected successfully');
  }

  async create(
    dto: CreateSubmissionDto,
    file: Express.Multer.File,
  ): Promise<Submission> {
    let filePath: string | undefined;

    try {
      // Generate tracking ID
      const trackingId = `UJGSM-${uuidv4().substring(0, 8).toUpperCase()}`;

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
        originalFileName: file.originalname,
        trackingId,
        status: SubmissionStatus.SUBMITTED,
      };

      if (
        isNaN(submissionData.totalAuthors) ||
        isNaN(submissionData.numberOfPages)
      ) {
        throw new BadRequestException(
          'Invalid number format for totalAuthors or numberOfPages',
        );
      }

      const submission = this.submissionRepository.create(submissionData);
      const savedSubmission = await this.submissionRepository.save(submission);

      // Send confirmation email - make sure this is called
      try {
        await this.emailService.sendSubmissionConfirmation(
          savedSubmission.correspondingAuthorEmail,
          savedSubmission.correspondingAuthorName,
          savedSubmission.trackingId,
          savedSubmission.manuscriptTitle,
        );
        this.logger.log(
          `Confirmation email sent to ${savedSubmission.correspondingAuthorEmail}`,
        );
      } catch (emailError) {
        this.logger.error(
          `Failed to send confirmation email: ${emailError.message}`,
        );
        // Don't throw error - submission was successful, just email failed
      }

      this.logger.log(`Creating submission with tracking ID: ${trackingId}`);
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

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: SubmissionStatus,
    search?: string,
  ): Promise<{
    data: Submission[];
    count: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.manuscriptTitle = Like(`%${search}%`);
      }

      const [data, count] = await this.submissionRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(count / limit);

      this.logger.log(`Fetched ${data.length} submissions out of ${count}`);
      return { data, count, page, totalPages };
    } catch (error) {
      this.logger.error(`Failed to fetch submissions: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch submissions');
    }
  }

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

  async findByTrackingId(trackingId: string): Promise<Submission> {
    try {
      const submission = await this.submissionRepository.findOne({
        where: { trackingId },
      });
      if (!submission) {
        throw new NotFoundException(
          `Submission with tracking ID ${trackingId} not found`,
        );
      }
      this.logger.log(`Fetched submission by tracking ID: ${trackingId}`);
      return submission;
    } catch (error) {
      this.logger.error(
        `Failed to fetch submission ${trackingId}: ${error.message}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch submission ${trackingId}`,
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
      });
      if (!submission) {
        throw new NotFoundException(
          `Submission with ID ${id} not found for email ${correspondingAuthorEmail}`,
        );
      }
      this.logger.log(`Fetched submission for ID: ${id} and email`);
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

  // async updateStatus(
  //   id: number,
  //   status: SubmissionStatus,
  //   adminRemarks?: string,
  // ): Promise<Submission> {
  //   try {
  //     const submission = await this.submissionRepository.findOne({
  //       where: { id },
  //     });

  //     if (!submission) {
  //       throw new NotFoundException(`Submission with ID ${id} not found`);
  //     }

  //     // Update fields
  //     submission.status = status || submission.status;
  //     if (adminRemarks !== undefined) {
  //       submission.adminRemarks = adminRemarks;
  //     }
  //     submission.updatedAt = new Date();

  //     const updatedSubmission =
  //       await this.submissionRepository.save(submission);

  //     submission.status = status;
  //     if (adminRemarks) {
  //       submission.adminRemarks = adminRemarks;
  //     }

  //     await this.submissionRepository.save(submission);
  //     this.logger.log(`Updated status of submission ${id} to ${status}`);
  //     return submission;
  //   } catch (error) {
  //     this.logger.error(`Failed to update submission ${id}: ${error.message}`);
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     throw new InternalServerErrorException(
  //       `Failed to update submission ${id}`,
  //     );
  //   }
  // }

  async updateStatus(
    id: number,
    status: SubmissionStatus,
    adminRemarks?: string,
  ): Promise<Submission> {
    try {
      const submission = await this.submissionRepository.findOne({
        where: { id },
      });

      if (!submission) {
        throw new NotFoundException(`Submission with ID ${id} not found`);
      }

      // Update fields
      submission.status = status || submission.status;
      if (adminRemarks !== undefined) {
        submission.adminRemarks = adminRemarks.trim();
      }
      submission.updatedAt = new Date();

      const updatedSubmission =
        await this.submissionRepository.save(submission);

      // Send status update email
      try {
        await this.emailService.sendStatusUpdate(
          updatedSubmission.correspondingAuthorEmail,
          updatedSubmission.correspondingAuthorName,
          updatedSubmission.trackingId,
          updatedSubmission.manuscriptTitle,
          updatedSubmission.status,
          updatedSubmission.adminRemarks || '',
        );
        this.logger.log(
          `Status update email sent to ${updatedSubmission.correspondingAuthorEmail} for submission ${id} with status ${status}`,
        );
      } catch (emailError) {
        this.logger.error(
          `Failed to send status update email: ${emailError.message}`,
        );
        // Non-blocking: update succeeds even if email fails
      }

      this.logger.log(`Updated status of submission ${id} to ${status}`);
      return updatedSubmission;
    } catch (error) {
      this.logger.error(`Failed to update submission ${id}: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException(`Failed to update submission ${id}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const submission = await this.submissionRepository.findOne({
        where: { id },
      });

      if (!submission) {
        throw new NotFoundException(`Submission with ID ${id} not found`);
      }

      // Extract file path from URL for deletion
      const filePath = submission.manuscriptFilePath.split('/').pop();
      if (filePath) {
        await this.supabaseService.deleteFile('manuscripts', filePath);
      }

      await this.submissionRepository.delete(id);
      this.logger.log(`Deleted submission: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete submission ${id}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete submission ${id}`,
      );
    }
  }
}
