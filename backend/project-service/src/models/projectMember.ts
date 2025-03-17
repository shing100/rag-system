import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Project } from './project';

export enum ProjectRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

@Entity('project_members')
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  projectId: string;

  @Column('uuid')
  userId: string;

  @Column({
    type: 'enum',
    enum: ProjectRole,
    default: ProjectRole.VIEWER,
  })
  role: ProjectRole;

  @CreateDateColumn()
  joinedAt: Date;

  @ManyToOne(() => Project, (project) => project.members)
  @JoinColumn({ name: 'projectId' })
  project: Project;
}
