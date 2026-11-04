import type { Prisma, PrismaClient } from '@prisma/client';

type AuditClient = PrismaClient | Prisma.TransactionClient;

export function recordAuditLog(
  client: AuditClient,
  entry: {
    action: string;
    actorId?: string;
    targetEntity: string;
    targetEntityId: string;
    metadata?: Prisma.InputJsonValue;
  },
) {
  return client.auditLog.create({
    data: {
      action: entry.action,
      actorId: entry.actorId,
      targetEntity: entry.targetEntity,
      targetEntityId: entry.targetEntityId,
      metadata: entry.metadata,
    },
  });
}
