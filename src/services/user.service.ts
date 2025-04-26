import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { IOTPResponse, IUserCreate, IUserEmail, IUserLogin, IVerifyOTP } from "../types/user.types";
import { AuditService } from "./audit.service";

const prisma = new PrismaClient();

export class UserService {
  static async register(userData: IUserCreate) {
    const exists = await prisma.user.findFirst({
      where: {
        email: userData.email,
      },
    });

    if (exists) {
      throw new Error("User already exists, Try logging in");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
      },
    });

    await AuditService.log(user.id, "SIGNUP");

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
      throw new Error("User does not exist. Register first");
    }

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isValidPassword) {
      await AuditService.log(user.id, "LOGIN_FAILED");
      throw new Error("Invalid credentials");
    }

    await AuditService.log(user.id, "LOGIN");
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );

    return { user: { id: user.id, email: user.email }, token };
  }

  static async makeAdmin(userData: IUserEmail, callerUserId: number) {
    // First verify if the caller is an admin
    const callerUser = await prisma.user.findUnique({
      where: { id: callerUserId },
    });

    if (!callerUser || callerUser.role !== "ADMIN") {
      throw new Error(
        "Unauthorized: Only admins can promote users to admin role"
      );
    }

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!targetUser) {
      throw new Error("User does not exist.");
    }

    // Update the user role to admin
    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: { role: "ADMIN" },
    });

    return {
      message: "User role updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    };
  }

  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOTP(email: string): Promise<IOTPResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const otp = this.generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiry,
      },
    });

    //  send this via email/SMS
    console.log(`Mock OTP for ${email}: ${otp}`);

    return {
      message: "OTP sent successfully",
      email: user.email,
    };
  }

  static async verifyOTP(data: IVerifyOTP): Promise<{ token: string; user: { id: number; email: string } }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.otp || !user.otpExpiry) {
      throw new Error("No OTP requested");
    }

    if (new Date() > user.otpExpiry) {
      throw new Error("OTP expired");
    }

    if (user.otp !== data.otp) {
      throw new Error("Invalid OTP");
    }

    // Clear OTP and mark as verified
    await prisma.user.update({
      where: { email: data.email },
      data: {
        otp: null,
        otpExpiry: null,
        isVerified: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );

    return { user: { id: user.id, email: user.email }, token };
  }
}