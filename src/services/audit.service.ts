import { PrismaClient, UserAction } from "../generated/prisma";

const prisma = new PrismaClient();

export class AuditService {
  static async log(
    userId: number,
    action: UserAction,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
    }
  ) {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
    });
  }
}
