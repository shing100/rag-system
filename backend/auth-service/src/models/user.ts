import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ select: false })
  password!: string;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ nullable: true })
  profileImage!: string | null;

  @Column({ default: 'local' })
  authProvider!: string;

  @Column({ nullable: true })
  authProviderId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 암호 비교 메서드 (실제 구현은 서비스 레이어에서)
  async comparePassword(candidatePassword: string): Promise<boolean> {
    // 비밀번호 비교 로직 (bcrypt 등 사용)
    return Promise.resolve(false); // 실제 구현 필요
  }

  // JWT 토큰 생성 (실제 구현은 서비스 레이어에서)
  generateJwtToken(): string {
    // JWT 생성 로직
    return ''; // 실제 구현 필요
  }
}
