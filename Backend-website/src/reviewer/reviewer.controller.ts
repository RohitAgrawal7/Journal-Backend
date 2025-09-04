import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReviewerService } from './reviewer.service';
import { CreateReviewerApplicationDto } from './dto/create-reviewer-application.dto';
import { ReviewerApplication } from './reviewer-application.entity';

@Controller('reviewer')
export class ReviewerController {
  private readonly logger = new Logger(ReviewerController.name);

  constructor(private reviewerService: ReviewerService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('cv', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(doc|docx|pdf|rtf)$/i)) {
          return cb(
            new BadRequestException(
              'Only .doc, .docx, .pdf, .rtf files allowed!',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  )
  async create(
    @Body() dto: CreateReviewerApplicationDto,
    @UploadedFile() cv: Express.Multer.File,
  ): Promise<{ message: string; application: ReviewerApplication }> {
    if (!cv) {
      throw new BadRequestException('CV is required');
    }
    const application = await this.reviewerService.create(dto, cv);
    this.logger.log(
      `Reviewer application created successfully: ${application.id}`,
    );
    return { message: 'Application successful!', application };
  }

  @Get()
  async findAll(): Promise<ReviewerApplication[]> {
    return await this.reviewerService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReviewerApplication> {
    return await this.reviewerService.findOne(id);
  }
}
