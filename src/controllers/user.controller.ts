import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { AuthRequest } from "../middleware/auth.middleware";

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
        res.status(400).json({ message: "An unknown error occurred" });
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
        res.status(400).json({ message: "An unknown error occurred" });
      }
    }
  }

  static async makeAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const callerUserId = req.user?.id;

      if (!callerUserId) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      const result = await UserService.makeAdmin({ email }, callerUserId);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Unauthorized")) {
          res.status(403).json({ message: error.message });
        } else {
          res.status(400).json({ message: error.message });
        }
      }
    }
  }

  static async sendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await UserService.sendOTP(email);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unknown error occurred" });
      }
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const result = await UserService.verifyOTP({ email, otp });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unknown error occurred" });
      }
    }
  }
}
