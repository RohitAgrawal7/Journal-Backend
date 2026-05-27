import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article, ArticleStatus } from './article.entity';

@Controller('articles')
export class ArticlesController {
  private readonly logger = new Logger(ArticlesController.name);

  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  async create(
    @Body() dto: CreateArticleDto,
  ): Promise<{ statusCode: number; message: string; data: Article }> {
    const article = await this.articlesService.create(dto);
    this.logger.log(`Article created via API: ${article.slug}`);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Article created successfully',
      data: article,
    };
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ArticleStatus,
    @Query('search') search?: string,
  ): Promise<{
    data: Article[];
    count: number;
    page: number;
    totalPages: number;
  }> {
    return this.articlesService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      status,
      search,
    );
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<Article> {
    return this.articlesService.findBySlug(slug);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Article> {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
  ): Promise<{ statusCode: number; message: string; data: Article }> {
    const article = await this.articlesService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Article updated successfully',
      data: article,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ statusCode: number; message: string }> {
    await this.articlesService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Article deleted successfully',
    };
  }
}
