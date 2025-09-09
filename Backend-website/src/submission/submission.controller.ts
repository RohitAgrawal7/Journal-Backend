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
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { Submission, SubmissionStatus } from './submission.entity';
import { UpdateSubmissionStatusDto } from './dto/create-submission.dto';

@Controller('submission')
export class SubmissionController {
  private readonly logger = new Logger(SubmissionController.name);

  constructor(private submissionService: SubmissionService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('manuscript', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(doc|docx|pdf)$/i)) {
          return cb(
            new BadRequestException(
              'Only .doc, .docx, and .pdf files allowed!',
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
    @Body() dto: CreateSubmissionDto,
    @UploadedFile() manuscript: Express.Multer.File,
  ): Promise<{ message: string; submission: Submission; trackingId: string }> {
    if (!manuscript) {
      throw new BadRequestException('Manuscript file is required');
    }

    const submission = await this.submissionService.create(dto, manuscript);
    this.logger.log(
      `Submission created successfully: ${submission.trackingId}`,
    );

    return {
      message: 'Submission successful!',
      submission,
      trackingId: submission.trackingId,
    };
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: SubmissionStatus,
    @Query('search') search?: string,
  ): Promise<{
    data: Submission[];
    count: number;
    page: number;
    totalPages: number;
  }> {
    return await this.submissionService.findAll(page, limit, status, search);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Submission> {
    return await this.submissionService.findOne(id);
  }

  @Get('track/:trackingId')
  async findByTrackingId(
    @Param('trackingId') trackingId: string,
  ): Promise<Submission> {
    return await this.submissionService.findByTrackingId(trackingId);
  }

  @Get('author/:id/:email')
  async findByManuscriptId(
    @Param('id', ParseIntPipe) id: number,
    @Param('email') email: string,
  ): Promise<Submission> {
    return await this.submissionService.findByManuscriptId(id, email);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSubmissionStatusDto,
  ): Promise<Submission> {
    return await this.submissionService.updateStatus(
      id,
      updateDto.status as SubmissionStatus,
      updateDto.adminRemarks,
    );
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.submissionService.delete(id);
    return { message: 'Submission deleted successfully' };
  }
}
