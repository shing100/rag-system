import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { DocumentVersion } from './documentVersion';

// 문서 상태를 위한 enum 타입 추가
export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  projectId!: string;

  @Column('uuid')
  uploaderId!: string;

  @Column()
  name!: string;

  @Column()
  filePath!: string;

  @Column()
  mimeType!: string;

  @Column('bigint')
  fileSize!: number;

  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING
  })
  status!: DocumentStatus;

  @Column({ default: 'auto' })
  language!: string;

  @Column({ nullable: true })
  errorMessage?: string;

  @Column({ default: false })
  isDeleted!: boolean;

  @CreateDateColumn()
  uploadedAt!: Date;

  @UpdateDateColumn({ nullable: true })
  processedAt!: Date | null;

  @OneToMany(() => DocumentVersion, version => version.document)
  versions!: DocumentVersion[];
}
