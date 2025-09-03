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
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { Submission } from './submission.entity';

@Controller('submission')
export class SubmissionController {
  private readonly logger = new Logger(SubmissionController.name);

  constructor(private submissionService: SubmissionService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(doc|docx|rtf)$/i)) {
          return cb(
            new BadRequestException('Only .doc, .docx, .rtf files allowed!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  )
  async create(
    @Body() createSubmissionDto: CreateSubmissionDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; submission: Submission }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const submission = await this.submissionService.create(
      createSubmissionDto,
      file,
    );
    this.logger.log(`Submission created successfully: ${submission.id}`);
    return { message: 'Submission successful!', submission };
  }

  // NEW: GET all submissions
  @Get()
  async findAll(): Promise<Submission[]> {
    return await this.submissionService.findAll();
  }

  // NEW: GET one submission by ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Submission> {
    return await this.submissionService.findOne(id);
  }

  @Get('manuscript/:id/:correspondingAuthorEmail')
  async findByManuscriptId(
    @Param('id', ParseIntPipe) id: number,
    @Param('correspondingAuthorEmail') correspondingAuthorEmail: string,
  ): Promise<Submission> {
    return await this.submissionService.findByManuscriptId(
      id,
      correspondingAuthorEmail,
    );
  }
}
