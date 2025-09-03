import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  IsOptional,
  MaxLength,
  Matches,
  IsIn,
} from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  @IsNotEmpty()
  desiredIssue: string;

  @IsString()
  @IsNotEmpty()
  manuscriptTitle: string;

  @IsString()
  @IsNotEmpty()
  abstract: string;

  @IsString()
  @IsNotEmpty()
  subjectArea: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'totalAuthors must be a numeric string' })
  totalAuthors: string;

  @IsString()
  @IsNotEmpty()
  correspondingAuthorName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  correspondingAuthorMobile: string;

  @IsEmail()
  @IsNotEmpty({ message: 'correspondingAuthorEmail is required' })
  correspondingAuthorEmail: string;

  @IsString()
  @IsNotEmpty()
  correspondingAuthorDepartment: string;

  @IsString()
  @IsNotEmpty()
  correspondingAuthorOrganization: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  whatsappNumber: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  authorType: string;

  @IsString()
  @IsNotEmpty()
  authorCategory: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'numberOfPages must be a numeric string' })
  numberOfPages: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['true', 'false'], {
    message: 'agreeToTerms must be "true" or "false"',
  })
  agreeToTerms: string;
}
