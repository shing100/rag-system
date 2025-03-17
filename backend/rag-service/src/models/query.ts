import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Response } from './response';

@Entity('queries')
export class Query {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  projectId: string;

  @Column('text')
  query: string;

  @Column({ nullable: true })
  language: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Response, (response) => response.query)
  responses: Response[];
}
