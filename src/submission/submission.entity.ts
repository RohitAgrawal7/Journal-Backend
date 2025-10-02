import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  REVISION_REQUIRED = 'revision_required',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('submission') // Changed to more standard table name
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  desiredIssue: string;

  @Column()
  manuscriptTitle: string;

  @Column('text')
  abstract: string;

  @Column()
  subjectArea: string;

  @Column('int')
  totalAuthors: number;

  @Column()
  correspondingAuthorName: string;

  @Column({ nullable: true })
  correspondingAuthorMobile: string;

  @Column()
  @Index() // Add index for faster email searches
  correspondingAuthorEmail: string;

  @Column({ nullable: true })
  correspondingAuthorDepartment: string;

  @Column({ nullable: true })
  correspondingAuthorOrganization: string;

  @Column({ nullable: true })
  whatsappNumber: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column()
  authorType: string;

  @Column()
  authorCategory: string;

  @Column('int')
  numberOfPages: number;

  @Column()
  manuscriptFilePath: string;

  @Column({ default: false })
  agreeToTerms: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: SubmissionStatus, // Updated enum name
    default: SubmissionStatus.SUBMITTED, // Updated default status
  })
  status: SubmissionStatus;

  @Column({ type: 'text', nullable: true })
  adminRemarks: string; // Changed from 'remarks' to match frontend

  // NEW: Add file name for better tracking
  @Column({ nullable: true })
  originalFileName: string;

  // NEW: Add tracking ID for external reference
  @Column({ unique: true, nullable: true })
  trackingId: string;

  // NEW: Add version for revision tracking
  @Column({ default: 1 })
  version: number;

  // NEW: Add reference to previous version for revisions
  @Column({ nullable: true })
  previousVersionId: number;
}
