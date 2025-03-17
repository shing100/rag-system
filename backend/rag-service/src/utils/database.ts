import { DataSource } from 'typeorm';
import { Query } from '../models/query';
import { Response } from '../models/response';
import config from '../config';
import logger from './logger';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.postgresUri,
  synchronize: config.nodeEnv === 'development',
  logging: config.nodeEnv === 'development',
  entities: [Query, Response],
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
