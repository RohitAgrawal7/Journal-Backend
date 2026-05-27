import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { ArticleAuthor, ArticleReference } from './interfaces/article.types';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  abstract: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  doi: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  volume: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  issue: string | null;

  @Column({ type: 'date', nullable: true })
  publicationDate: Date | null;

  @Column({ type: 'jsonb', default: [] })
  keywords: string[];

  @Column({ type: 'jsonb', default: [] })
  authors: ArticleAuthor[];

  @Column({ type: 'jsonb', default: [] })
  references: ArticleReference[];

  @Column({ type: 'varchar', length: 2000, nullable: true })
  pdfUrl: string | null;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  coverImageUrl: string | null;

  @Column({ type: 'text', nullable: true })
  licenseText: string | null;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  licenseImageUrl: string | null;

  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
