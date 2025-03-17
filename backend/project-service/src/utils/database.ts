import { DataSource } from 'typeorm';
import { Project } from '../models/project';
import { ProjectMember } from '../models/projectMember';
import { ProjectSettings } from '../models/projectSettings';
import config from '../config';
import logger from './logger';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.postgresUri,
  synchronize: config.nodeEnv === 'development',
  logging: config.nodeEnv === 'development',
  entities: [Project, ProjectMember, ProjectSettings],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Error during database initialization', { error });
    throw error;
  }
};
