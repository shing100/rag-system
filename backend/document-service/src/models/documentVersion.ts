import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Document } from './document';

@Entity('document_versions')
export class DocumentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  documentId: string;

  @Column()
  versionNumber: number;

  @Column()
  filePath: string;

  @Column()
  fileSize: number;

  @Column('uuid')
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Document, (document) => document.versions)
  @JoinColumn({ name: 'documentId' })
  document: Document;
}
