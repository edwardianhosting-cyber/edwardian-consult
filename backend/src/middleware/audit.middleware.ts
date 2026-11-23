import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

type AuditAction = 
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'
  | 'PAYMENT' | 'ENROLL' | 'CBT_START' | 'CBT_COMPLETE'
  | 'EMAIL_SENT' | 'NOTIFICATION_SENT' | 'PROFILE_UPDATE'
  | 'DOCUMENT_UPLOAD' | 'CERTIFICATE_ISSUED' | 'ID_CARD_GENERATED'
  | 'ADMISSION_APPLY' | 'ATTENDANCE_MARK' | 'REFERRAL_USED';

export function auditLog(
  action: AuditAction,
  entityType: string,
  entityId?: string,
  description?: string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(body: any) {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        const userId = (req as any).user?.userId || null;
        
        prisma.auditLog.create({
          data: {
            userId,
            action,
            entityType,
            entityId: entityId || body?.data?.id || null,
            newValue: body?.data || null,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.get('User-Agent'),
            description: description || `${action} on ${entityType}`,
          },
        }).catch(() => {});
      }
      
      return originalJson(body);
    };
    
    next();
  };
}

export async function createAuditLog(data: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: any;
  newValue?: any;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId || null,
        oldValue: data.oldValue || undefined,
        newValue: data.newValue || undefined,
        description: data.description,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
