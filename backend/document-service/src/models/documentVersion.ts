import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Document } from './document';

@Entity('document_versions')
export class DocumentVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  documentId!: string;

  @Column()
  versionNumber!: number;

  @Column()
  filePath!: string;

  @Column('bigint')
  fileSize!: number;

  @Column('uuid')
  createdBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @ManyToOne(() => Document, document => document.versions)
  @JoinColumn({ name: 'documentId' })
  document!: Document;
}
