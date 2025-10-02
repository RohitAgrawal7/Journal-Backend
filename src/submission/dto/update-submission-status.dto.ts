import { IsString, IsOptional, IsEnum } from 'class-validator';
import { SubmissionStatus } from '../submission.entity';

export class UpdateSubmissionStatusDto {
  @IsEnum(SubmissionStatus)
  @IsOptional()
  status?: SubmissionStatus;

  @IsString()
  @IsOptional()
  adminRemarks?: string;
}
