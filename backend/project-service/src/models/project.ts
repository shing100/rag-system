import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { ProjectMember } from './projectMember';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ default: 'general' })
  category!: string;

  @Column('simple-array', { default: '' })
  tags!: string[];

  @Column({ default: false })
  isPublic!: boolean;

  @Column({ default: false })
  isArchived!: boolean;

  @Column('uuid')
  ownerId!: string;

  @Column({ default: 0 })
  documentCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => ProjectMember, member => member.project)
  members!: ProjectMember[];
}
