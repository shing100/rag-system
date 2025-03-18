import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project';

@Entity('project_settings')
export class ProjectSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string = '';

  @Column({ type: 'uuid' })
  projectId: string = '';

  @Column({ default: 'text-embedding-ada-002' })
  embeddingModel: string = 'text-embedding-ada-002';

  @Column({ default: 'gpt-3.5-turbo' })
  llmModel: string = 'gpt-3.5-turbo';

  @Column({ default: 5 })
  maxDocumentsPerQuery: number = 5;

  @Column({ type: 'float', default: 0.7 })
  similarityThreshold: number = 0.7;

  @Column({ default: 500 })
  chunkSize: number = 500;

  @Column({ default: 50 })
  chunkOverlap: number = 50;

  @ManyToOne(() => Project, project => project.settings, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'projectId' })
  project: Project = new Project();
}
