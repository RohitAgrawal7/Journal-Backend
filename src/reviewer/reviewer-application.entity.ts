import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reviewer_applications')
export class ReviewerApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  salutation: string;

  @Column()
  fullName: string;

  @Column()
  gender: string;

  @Column()
  currentEmployment: string;

  @Column('int')
  totalExperience: number;

  @Column('text')
  educationalQualifications: string;

  @Column('simple-array')
  researchAreas: string[];

  @Column()
  institutionalEmail: string;

  @Column()
  personalEmail: string;

  @Column()
  mobileNo: string;

  @Column()
  whatsappNo: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column('int')
  internationalPublications: number;

  @Column()
  howFoundUs: string;

  @Column()
  cvPath: string; // Supabase Storage URL

  @Column()
  firstReferenceName: string;

  @Column()
  firstReferenceEmail: string;

  @Column()
  firstReferenceOrg: string;

  @Column()
  firstReferenceMobile: string;

  @Column()
  secondReferenceName: string;

  @Column()
  secondReferenceEmail: string;

  @Column()
  secondReferenceOrg: string;

  @Column()
  secondReferenceMobile: string;

  @Column({ default: false })
  agreeToTerms: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
