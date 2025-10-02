import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewerApplication } from './reviewer-application.entity';
import { CreateReviewerApplicationDto } from './dto/create-reviewer-application.dto';
import { SupabaseService } from '../submission/supabase.service';
import sanitizeFilename from 'sanitize-filename';

@Injectable()
export class ReviewerService {
  private readonly logger = new Logger(ReviewerService.name);

  constructor(
    @InjectRepository(ReviewerApplication)
    private reviewerRepository: Repository<ReviewerApplication>,
    private supabaseService: SupabaseService,
  ) {}

  async create(
    dto: CreateReviewerApplicationDto,
    cv: Express.Multer.File,
  ): Promise<ReviewerApplication> {
    let cvPath: string | undefined;

    try {
      const sanitizedName = sanitizeFilename(cv.originalname);
      cvPath = `${Date.now()}_${sanitizedName}`;
      const uploadedPath = await this.supabaseService.uploadFile(
        cv,
        cvPath,
        'reviewercv',
      );
      const cvUrl = this.supabaseService.getFileUrl('reviewercv', uploadedPath);

      const applicationData = {
        ...dto,
        totalExperience: parseInt(dto.totalExperience, 10),
        internationalPublications: parseInt(dto.internationalPublications, 10),
        researchAreas: dto.researchAreas.filter((area) => area.trim() !== ''),
        cvPath: cvUrl,
      };

      if (
        isNaN(applicationData.totalExperience) ||
        isNaN(applicationData.internationalPublications)
      ) {
        throw new Error(
          'Invalid number format for totalExperience or internationalPublications',
        );
      }

      const application = this.reviewerRepository.create(applicationData);
      this.logger.log(
        `Creating reviewer application: ${JSON.stringify(application)}`,
      );
      return await this.reviewerRepository.save(application);
    } catch (error) {
      this.logger.error(
        `Reviewer application creation failed: ${error.message}`,
      );
      if (cvPath) {
        await this.supabaseService
          .deleteFile('reviewercv', cvPath)
          .catch((deleteError) => {
            this.logger.error(
              `Failed to delete CV during rollback: ${deleteError.message}`,
            );
          });
      }
      throw new InternalServerErrorException(
        `Application failed: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<ReviewerApplication[]> {
    try {
      const applications = await this.reviewerRepository.find({
        order: { createdAt: 'DESC' },
      });
      this.logger.log(`Fetched ${applications.length} reviewer applications`);
      return applications;
    } catch (error) {
      this.logger.error(
        `Failed to fetch reviewer applications: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to fetch reviewer applications',
      );
    }
  }

  async findOne(id: number): Promise<ReviewerApplication> {
    try {
      const application = await this.reviewerRepository.findOne({
        where: { id },
      });
      if (!application) {
        throw new NotFoundException(
          `Reviewer application with ID ${id} not found`,
        );
      }
      this.logger.log(`Fetched reviewer application: ${id}`);
      return application;
    } catch (error) {
      this.logger.error(
        `Failed to fetch reviewer application ${id}: ${error.message}`,
      );
      throw error;
    }
  }
}
