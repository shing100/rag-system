import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Project } from './project';

@Entity('project_settings')
export class ProjectSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  projectId: string;

  @Column({ default: 'openai' })
  embeddingModel: string;

  @Column({ default: 'openai' })
  llmModel: string;

  @Column({ type: 'json', default: {} })
  chunkingSettings: any;

  @Column({ type: 'json', default: {} })
  searchSettings: any;

  @Column({ type: 'json', default: {} })
  accessControls: any;

  @OneToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;
}
