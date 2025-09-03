import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Controller('submission')
export class SubmissionController {
  private readonly logger = new Logger(SubmissionController.name);

  constructor(private submissionService: SubmissionService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(doc|docx|rtf)$/i)) {
          // Case-insensitive
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
  ) {
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
}
