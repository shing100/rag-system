import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Query } from './query';

@Entity('responses')
export class Response {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  queryId: string;

  @Column('text')
  response: string;

  @Column()
  model: string;

  @Column({ type: 'json' })
  modelParams: any;

  @Column()
  tokenCount: number;

  @Column({ type: 'json' })
  sourceChunks: any;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  feedbackRating: number;

  @ManyToOne(() => Query, (query) => query.responses)
  @JoinColumn({ name: 'queryId' })
  query: Query;
}
