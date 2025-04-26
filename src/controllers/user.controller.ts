import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await UserService.register({ email, password });
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login({ email, password });
      res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
          } else {
            res.status(400).json({ message: 'An unknown error occurred' });
          }
    }
  }
}