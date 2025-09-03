import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TrackStatus {
  RECEIVED = 'Received',
  UNDER_REVIEW = 'Under Review',
  REVISION = 'Revision',
  CORRECTION = 'Correction',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

@Entity('submissions') // Table name in Supabase (ensure lowercase in DB)
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

  @Column()
  correspondingAuthorMobile: string;

  @Column()
  correspondingAuthorEmail: string;

  @Column()
  correspondingAuthorDepartment: string;

  @Column()
  correspondingAuthorOrganization: string;

  @Column()
  whatsappNumber: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column()
  country: string;

  @Column()
  authorType: string;

  @Column()
  authorCategory: string;

  @Column('int')
  numberOfPages: number;

  @Column()
  manuscriptFilePath: string; // Supabase Storage URL

  @Column({ default: false })
  agreeToTerms: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: TrackStatus,
    default: TrackStatus.UNDER_REVIEW,
  })
  status: TrackStatus;

  @Column({ nullable: true })
  remarks: string;
  //
}
