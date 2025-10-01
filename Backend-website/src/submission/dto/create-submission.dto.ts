import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  IsOptional,
  MaxLength,
  Matches,
  IsIn,
  IsNumberString,
  Length,
} from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  @IsNotEmpty()
  desiredIssue: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  manuscriptTitle: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  abstract: string;

  @IsString()
  @IsNotEmpty()
  subjectArea: string;

  @IsNumberString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d*$/, { message: 'totalAuthors must be a positive integer' })
  totalAuthors: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  correspondingAuthorName: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 15)
  @Matches(/^[0-9+\s()-]+$/, { message: 'Please provide a valid phone number' })
  correspondingAuthorMobile: string;

  @IsEmail()
  @IsNotEmpty()
  correspondingAuthorEmail: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  correspondingAuthorDepartment: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  correspondingAuthorOrganization: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 15)
  @Matches(/^[0-9+\s()-]+$/, {
    message: 'Please provide a valid WhatsApp number',
  })
  whatsappNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  city: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  state?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  country: string;

  @IsString()
  @IsNotEmpty()
  authorType: string;

  @IsString()
  @IsNotEmpty()
  authorCategory: string;

  @IsNumberString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d*$/, {
    message: 'numberOfPages must be a positive integer',
  })
  numberOfPages: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['true', 'false'], {
    message: 'agreeToTerms must be "true" or "false"',
  })
  agreeToTerms: string;
}

// NEW: Add DTO for updating submission status
// export class UpdateSubmissionStatusDto {
//   @IsString()
//   @IsNotEmpty()
//   @IsIn([
//     'submitted',
//     'under_review',
//     'revision_required',
//     'accepted',
//     'rejected',
//   ])
//   status: string;

//   @IsString()
//   @IsOptional()
//   adminRemarks?: string;
// }

// NEW: Add DTO for updating submission status
export class UpdateSubmissionStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'submitted',
    'under_review',
    'revision_required',
    'accepted',
    'rejected',
  ])
  status: string;

  @IsString()
  @IsOptional()
  adminRemarks?: string;
}
