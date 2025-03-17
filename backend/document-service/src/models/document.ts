import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { DocumentVersion } from './documentVersion';

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  projectId: string;

  @Column('uuid')
  uploaderId: string;

  @Column()
  name: string;

  @Column()
  filePath: string;

  @Column()
  mimeType: string;

  @Column()
  fileSize: number;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({ nullable: true })
  language: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  uploadedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  processedAt: Date;

  @OneToMany(() => DocumentVersion, (version) => version.document)
  versions: DocumentVersion[];
}
