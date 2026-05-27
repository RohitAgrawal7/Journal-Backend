import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AuthorDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  affiliation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  orcid?: string;
}
