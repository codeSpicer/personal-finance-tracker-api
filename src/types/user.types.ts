export interface IUser {
    id: number;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface IUserCreate {
    email: string;
    password: string;
  }
  
  export interface IUserLogin {
    email: string;
    password: string;
  }
  
  export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
  }