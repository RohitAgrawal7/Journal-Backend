import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsArray,
  IsBoolean,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReviewerApplicationDto {
  @IsString()
  @IsNotEmpty()
  salutation: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  currentEmployment: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'totalExperience must be a numeric string' })
  totalExperience: string;

  @IsString()
  @IsNotEmpty()
  educationalQualifications: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return Array.isArray(value) ? value : [value];
  })
  researchAreas: string[];

  @IsEmail()
  @IsNotEmpty()
  institutionalEmail: string;

  @IsEmail()
  @IsNotEmpty()
  personalEmail: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/^\+\d{1,3}\s?\d{9,12}$/, {
    message: 'Invalid mobile number format (e.g., +91 9876543210)',
  })
  mobileNo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/^\+\d{1,3}\s?\d{9,12}$/, {
    message: 'Invalid WhatsApp number format (e.g., +91 9876543210)',
  })
  whatsappNo: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, {
    message: 'internationalPublications must be a numeric string',
  })
  internationalPublications: string;

  @IsString()
  @IsNotEmpty()
  howFoundUs: string;

  @IsString()
  @IsNotEmpty()
  firstReferenceName: string;

  @IsEmail()
  @IsNotEmpty()
  firstReferenceEmail: string;

  @IsString()
  @IsNotEmpty()
  firstReferenceOrg: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/^\+\d{1,3}\s?\d{9,12}$/, {
    message: 'Invalid mobile number format (e.g., +91 9876543210)',
  })
  firstReferenceMobile: string;

  @IsString()
  @IsNotEmpty()
  secondReferenceName: string;

  @IsEmail()
  @IsNotEmpty()
  secondReferenceEmail: string;

  @IsString()
  @IsNotEmpty()
  secondReferenceOrg: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/^\+\d{1,3}\s?\d{9,12}$/, {
    message: 'Invalid mobile number format (e.g., +91 9876543210)',
  })
  secondReferenceMobile: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  agreeToTerms: boolean;
}
