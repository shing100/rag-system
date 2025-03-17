import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProjectMember } from './projectMember';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: false })
  isArchived: boolean;

  @Column()
  ownerId: string;

  @Column({ default: 0 })
  documentCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProjectMember, (member) => member.project)
  members: ProjectMember[];
}
