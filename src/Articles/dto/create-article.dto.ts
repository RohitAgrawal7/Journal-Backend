import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { AuthorDto } from './author.dto';
import { ArticleStatus } from '../article.entity';

/** Admin form fields only — all optional */
export class CreateArticleDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  title?: string;

  @IsString()
  @IsOptional()
  abstract?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  doi?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  volume?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  issue?: string;

  @IsDateString()
  @IsOptional()
  publicationDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthorDto)
  @IsOptional()
  authors?: AuthorDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  references?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  pdfUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  licenseText?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  licenseImageUrl?: string;

  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;
}
