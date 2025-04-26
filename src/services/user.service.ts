import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IUserCreate, IUserLogin } from '../types/user.types';

const prisma = new PrismaClient();

export class UserService {
  static async register(userData: IUserCreate) {

    const exists = await prisma.user.findFirst({
        where:{
            email:userData.email
        }
    })

    if( exists){
        throw new Error("User already exists, Try logging in")
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );

    return { user: { id: user.id, email: user.email }, token };

  }

  static async login(credentials: IUserLogin) {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new Error('User does not exist. Register first');
    }

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );

    return { user: { id: user.id, email: user.email }, token };
  }
}