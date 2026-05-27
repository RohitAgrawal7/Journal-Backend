import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Article, ArticleStatus } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async create(dto: CreateArticleDto): Promise<Article> {
    try {
      const slugSource = dto.title?.trim() || `article-${Date.now()}`;
      const slug = await this.resolveUniqueSlug(slugSource);

      const article = this.articleRepository.create({
        slug,
        title: dto.title?.trim() || null,
        abstract: dto.abstract?.trim() || null,
        doi: dto.doi?.trim() || null,
        volume: dto.volume?.trim() || null,
        issue: dto.issue?.trim() || null,
        publicationDate: dto.publicationDate
          ? new Date(dto.publicationDate)
          : null,
        keywords: dto.keywords ?? [],
        authors: dto.authors ?? [],
        references: dto.references ?? [],
        pdfUrl: dto.pdfUrl?.trim() || null,
        coverImageUrl: dto.coverImageUrl?.trim() || null,
        licenseText: dto.licenseText?.trim() || null,
        licenseImageUrl: dto.licenseImageUrl?.trim() || null,
        status: dto.status ?? ArticleStatus.DRAFT,
      });

      const saved = await this.articleRepository.save(article);
      this.logger.log(`Article created: id=${saved.id} slug=${saved.slug}`);
      return saved;
    } catch (error) {
      this.logger.error(`Article creation failed: ${error.message}`);
      if (error.code === '23505') {
        throw new BadRequestException('DOI or slug already exists');
      }
      throw new InternalServerErrorException(
        `Failed to create article: ${error.message}`,
      );
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: ArticleStatus,
    search?: string,
  ): Promise<{
    data: Article[];
    count: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const where: Record<string, unknown> = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.title = Like(`%${search}%`);
      }

      const [data, count] = await this.articleRepository.findAndCount({
        where,
        order: { publicationDate: 'DESC', createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return {
        data,
        count,
        page,
        totalPages: Math.ceil(count / limit) || 1,
      };
    } catch (error) {
      this.logger.error(`Failed to list articles: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch articles');
    }
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }
    return article;
  }

  async update(id: number, dto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOne(id);

    if (dto.title !== undefined) {
      article.title = dto.title?.trim() || null;
      if (dto.title?.trim()) {
        article.slug = await this.resolveUniqueSlug(dto.title.trim(), id);
      }
    }
    if (dto.abstract !== undefined) {
      article.abstract = dto.abstract?.trim() || null;
    }
    if (dto.doi !== undefined) article.doi = dto.doi?.trim() || null;
    if (dto.volume !== undefined) article.volume = dto.volume?.trim() || null;
    if (dto.issue !== undefined) article.issue = dto.issue?.trim() || null;
    if (dto.publicationDate !== undefined) {
      article.publicationDate = dto.publicationDate
        ? new Date(dto.publicationDate)
        : null;
    }
    if (dto.keywords !== undefined) article.keywords = dto.keywords ?? [];
    if (dto.authors !== undefined) article.authors = dto.authors ?? [];
    if (dto.references !== undefined) article.references = dto.references ?? [];
    if (dto.pdfUrl !== undefined) article.pdfUrl = dto.pdfUrl?.trim() || null;
    if (dto.coverImageUrl !== undefined) {
      article.coverImageUrl = dto.coverImageUrl?.trim() || null;
    }
    if (dto.licenseText !== undefined) {
      article.licenseText = dto.licenseText?.trim() || null;
    }
    if (dto.licenseImageUrl !== undefined) {
      article.licenseImageUrl = dto.licenseImageUrl?.trim() || null;
    }
    if (dto.status !== undefined) article.status = dto.status;

    try {
      const updated = await this.articleRepository.save(article);
      this.logger.log(`Article updated: id=${id}`);
      return updated;
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('DOI or slug already exists');
      }
      throw new InternalServerErrorException(
        `Failed to update article: ${error.message}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    const article = await this.findOne(id);
    await this.articleRepository.remove(article);
    this.logger.log(`Article deleted: id=${id}`);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 200);
  }

  private async resolveUniqueSlug(
    source: string,
    excludeId?: number,
  ): Promise<string> {
    const base = this.slugify(source) || `article-${Date.now()}`;
    let candidate = base;
    let suffix = 0;

    while (true) {
      const existing = await this.articleRepository.findOne({
        where: { slug: candidate },
      });
      if (!existing || existing.id === excludeId) {
        return candidate;
      }
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
  }
}
