import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { User } from '../models/user';

type UserPayload = {
  id: string;
  email: string;
  name: string;
};

export const generateToken = (userPayload: UserPayload): string => {
  const payload: UserPayload = {
    id: userPayload.id,
    email: userPayload.email,
    name: userPayload.name,
  };

  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, config.jwtSecret as jwt.Secret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwtSecret as jwt.Secret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};