import { prisma } from '../lib/prisma';
import { sendEmail, EmailPurpose } from '../lib/email';
import { sendPushToUser, sendPushToUsers } from './push.service';

export type NotificationType =
  | 'SYSTEM' | 'CBT' | 'PAYMENT' | 'ADMISSION' | 'ANNOUNCEMENT'
  | 'ASSIGNMENT' | 'RESULT' | 'REMINDER' | 'PROFILE' | 'MESSAGE'
  | 'CERTIFICATE' | 'ID_CARD' | 'MATERIAL' | 'EXAM';

export type NotificationPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export type NotificationChannel = 'DASHBOARD' | 'EMAIL' | 'SMS' | 'PUSH';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  link?: string;
  entityType?: string;
  entityId?: string;
  channels?: NotificationChannel[];
  emailSubject?: string;
  emailContent?: string;
  smsContent?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  const {
    userId,
    title,
    message,
    type,
    priority = 'NORMAL',
    link,
    entityType,
    entityId,
    channels = ['DASHBOARD', 'PUSH'],
    emailSubject,
    emailContent,
    smsContent,
  } = params;

  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      priority,
      link,
      entityType,
      entityId,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      studentEmail: true,
      fullName: true,
      phone: true,
      notificationPreferences: true,
    },
  });

  if (!user) return notification;

  const preferences = user.notificationPreferences as any || {};

  if (channels.includes('EMAIL') && preferences.email !== false) {
    await sendEmail({
      to: user.studentEmail || user.email,
      subject: emailSubject || title,
      html: emailContent || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #8B6F47; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Edwardian Educational Consult</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #333;">${title}</h2>
            <p style="color: #666; font-size: 16px;">${message}</p>
            ${link ? `<a href="${process.env.FRONTEND_URL}${link}" style="display: inline-block; background: #8B6F47; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px;">View Details</a>` : ''}
          </div>
        </div>
      `,
    });
  }

  if (channels.includes('SMS') && preferences.sms !== false && user.phone) {
    await prisma.smsLog.create({
      data: {
        recipient: user.phone,
        message: smsContent || `${title}: ${message}`,
        smsType: type,
        status: 'QUEUED',
      },
    });
  }

  if (channels.includes('PUSH') && preferences.push !== false && preferences.pushNotifications !== false) {
    await sendPushToUser(userId, { title, message, link, type });
  }

  return notification;
}

export async function createBulkNotifications(
  userIds: string[],
  title: string,
  message: string,
  type: NotificationType,
  options?: {
    priority?: NotificationPriority;
    link?: string;
    entityType?: string;
    entityId?: string;
    channels?: NotificationChannel[];
    emailPurpose?: EmailPurpose;
  }
) {
  const notifications = userIds.map(userId => ({
    userId,
    title,
    message,
    type,
    priority: options?.priority || 'NORMAL',
    link: options?.link,
    entityType: options?.entityType,
    entityId: options?.entityId,
  }));

  await prisma.notification.createMany({ data: notifications });

  const channels = options?.channels || ['DASHBOARD', 'PUSH'];

  if (channels.includes('EMAIL')) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { email: true, studentEmail: true, fullName: true },
    });

    const purpose = options?.emailPurpose || 'NOTIFICATION';

    for (const user of users) {
      await sendEmail({
        to: user.studentEmail || user.email,
        subject: title,
        html: `<p>${message}</p>${options?.link ? `<p><a href="${process.env.FRONTEND_URL}${options.link}">View Details</a></p>` : ''}`,
        purpose,
        name: user.fullName,
      });
    }
  }

  if (channels.includes('PUSH')) {
    const pushRecipients = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, notificationPreferences: true },
    });
    const pushUserIds = pushRecipients
      .filter((u) => {
        const p = (u.notificationPreferences as any) || {};
        return p.push !== false && p.pushNotifications !== false;
      })
      .map((u) => u.id);

    await sendPushToUsers(pushUserIds, { title, message, link: options?.link, type });
  }

  return notifications.length;
}

export async function markNotificationRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function getUserNotifications(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
    priority?: string;
  } = {}
) {
  const {
    page = 1,
    limit = 20,
    type,
    isRead,
    priority,
  } = options;

  const where: any = { userId };
  if (type && type !== 'ALL') where.type = type;
  if (isRead !== undefined) where.isRead = isRead;
  if (priority) where.priority = priority;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getRecentNotifications(userId: string, limit = 5) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
}

// Automated notification triggers
export async function notifyWelcome(userId: string) {
  return createNotification({
    userId,
    title: 'Welcome to Edwardian Educational Consult!',
    message: 'Your account has been created successfully. Complete your profile to get started.',
    type: 'SYSTEM',
    priority: 'IMPORTANT',
    link: '/student/profile',
    entityType: 'USER',
    entityId: userId,
    channels: ['DASHBOARD', 'EMAIL'],
    emailSubject: 'Welcome to Edwardian Educational Consult',
  });
}

export async function notifyNewCBT(userId: string, cbtTitle: string, cbtId: string) {
  return createNotification({
    userId,
    title: 'New CBT Available',
    message: `A new CBT "${cbtTitle}" is now available for practice.`,
    type: 'CBT',
    priority: 'IMPORTANT',
    link: `/student/cbt/${cbtId}`,
    entityType: 'CBT',
    entityId: cbtId,
    channels: ['DASHBOARD', 'EMAIL'],
    emailSubject: `New CBT: ${cbtTitle}`,
  });
}

export async function notifyCBTResult(userId: string, cbtTitle: string, score: number, resultId: string) {
  return createNotification({
    userId,
    title: 'CBT Result Released',
    message: `Your result for "${cbtTitle}" is now available. You scored ${score}%.`,
    type: 'RESULT',
    priority: 'IMPORTANT',
    link: `/student/results/${resultId}`,
    entityType: 'RESULT',
    entityId: resultId,
    channels: ['DASHBOARD', 'EMAIL'],
    emailSubject: `CBT Result: ${cbtTitle}`,
  });
}

export async function notifyPaymentSuccess(userId: string, amount: number, reference: string) {
  return createNotification({
    userId,
    title: 'Payment Successful',
    message: `Your payment of ₦${amount.toLocaleString()} has been confirmed. Reference: ${reference}`,
    type: 'PAYMENT',
    priority: 'IMPORTANT',
    link: '/student/wallet',
    entityType: 'PAYMENT',
    entityId: reference,
    channels: ['DASHBOARD', 'EMAIL'],
    emailSubject: 'Payment Confirmation',
    smsContent: `Your payment of ₦${amount.toLocaleString()} has been confirmed. Ref: ${reference}`,
  });
}

export async function notifyPaymentFailed(userId: string, amount: number, reference: string) {
  return createNotification({
    userId,
    title: 'Payment Failed',
    message: `Your payment of ₦${amount.toLocaleString()} failed. Please try again. Reference: ${reference}`,
    type: 'PAYMENT',
    priority: 'URGENT',
    link: '/student/payments',
    entityType: 'PAYMENT',
    entityId: reference,
    channels: ['DASHBOARD', 'EMAIL', 'SMS'],
    emailSubject: 'Payment Failed',
    smsContent: `Your payment of ₦${amount.toLocaleString()} failed. Please try again or contact support.`,
  });
}

export async function notifyAdmissionUpdate(userId: string, status: string, institution: string, applicationId: string) {
  return createNotification({
    userId,
    title: 'Admission Status Update',
    message: `Your admission application to ${institution} has been ${status}.`,
    type: 'ADMISSION',
    priority: 'IMPORTANT',
    link: '/student/dashboard',
    entityType: 'APPLICATION',
    entityId: applicationId,
    channels: ['DASHBOARD', 'EMAIL'],
    emailSubject: 'Admission Update',
  });
}

export async function notifyPostUTMEOpen(userId: string, institution: string, deadline: string) {
  return createNotification({
    userId,
    title: 'Post-UTME Registration Open',
    message: `Post-UTME registration for ${institution} is now open. Deadline: ${deadline}`,
    type: 'ADMISSION',
    priority: 'URGENT',
    link: '/student/dashboard',
    channels: ['DASHBOARD', 'EMAIL', 'SMS'],
    emailSubject: 'Post-UTME Registration Open',
    smsContent: `Post-UTME registration for ${institution} is now open. Register before ${deadline}.`,
  });
}

export async function notifyMockExamReminder(userId: string, examTitle: string, date: string, examId: string) {
  return createNotification({
    userId,
    title: 'Mock Examination Reminder',
    message: `Your mock exam "${examTitle}" is scheduled for ${date}.`,
    type: 'EXAM',
    priority: 'URGENT',
    link: `/student/mock/${examId}`,
    entityType: 'EXAM',
    entityId: examId,
    channels: ['DASHBOARD', 'EMAIL', 'SMS'],
    emailSubject: `Reminder: ${examTitle}`,
    smsContent: `Reminder: Your mock exam "${examTitle}" is on ${date}.`,
  });
}

export async function notifyNewAssignment(userId: string, assignmentTitle: string, dueDate: string, assignmentId: string) {
  return createNotification({
    userId,
    title: 'New Assignment Available',
    message: `A new assignment "${assignmentTitle}" has been posted. Due: ${dueDate}`,
    type: 'ASSIGNMENT',
    priority: 'IMPORTANT',
    link: `/student/assignments/${assignmentId}`,
    entityType: 'ASSIGNMENT',
    entityId: assignmentId,
    channels: ['DASHBOARD', 'EMAIL'],
    emailSubject: `New Assignment: ${assignmentTitle}`,
  });
}

export async function notifyAssignmentGraded(userId: string, assignmentTitle: string, grade: string, assignmentId: string) {
  return createNotification({
    userId,
    title: 'Assignment Graded',
    message: `Your assignment "${assignmentTitle}" has been graded. Grade: ${grade}`,
    type: 'RESULT',
    priority: 'IMPORTANT',
    link: `/student/assignments/${assignmentId}`,
    entityType: 'ASSIGNMENT',
    entityId: assignmentId,
    channels: ['DASHBOARD', 'EMAIL'],
    emailSubject: `Assignment Graded: ${assignmentTitle}`,
  });
}

export async function notifyNewMaterial(userId: string, materialTitle: string, subject: string, materialId: string) {
  return createNotification({
    userId,
    title: 'New Study Material',
    message: `New study material "${materialTitle}" for ${subject} is now available.`,
    type: 'MATERIAL',
    priority: 'NORMAL',
    link: `/student/materials/${materialId}`,
    entityType: 'MATERIAL',
    entityId: materialId,
    channels: ['DASHBOARD'],
  });
}

export async function notifyCertificateGenerated(userId: string, programme: string, certificateId: string) {
  return createNotification({
    userId,
    title: 'Certificate Generated',
    message: `Your certificate for ${programme} has been generated and is ready for download.`,
    type: 'CERTIFICATE',
    priority: 'IMPORTANT',
    link: `/student/wallet`,
    entityType: 'CERTIFICATE',
    entityId: certificateId,
    channels: ['DASHBOARD', 'EMAIL'],
    emailSubject: 'Your Certificate is Ready',
  });
}

export async function notifyIdCardGenerated(userId: string) {
  return createNotification({
    userId,
    title: 'Student ID Card Ready',
    message: 'Your digital student ID card has been generated.',
    type: 'ID_CARD',
    priority: 'IMPORTANT',
    link: '/student/id-card',
    entityType: 'ID_CARD',
    entityId: userId,
    channels: ['DASHBOARD', 'EMAIL'],
    emailSubject: 'Your Student ID Card is Ready',
  });
}

export async function notifyProfileCompletion(userId: string, completionPercent: number) {
  if (completionPercent < 100) {
    return createNotification({
      userId,
      title: 'Complete Your Profile',
      message: `Your profile is ${completionPercent}% complete. Fill in all details for a better experience.`,
      type: 'PROFILE',
      priority: 'NORMAL',
      link: '/student/profile',
      entityType: 'USER',
      entityId: userId,
      channels: ['DASHBOARD'],
    });
  }
}

export async function notifyTimetableUpdate(userId: string, classTitle: string) {
  return createNotification({
    userId,
    title: 'Timetable Updated',
    message: `Your timetable for "${classTitle}" has been updated.`,
    type: 'REMINDER',
    priority: 'IMPORTANT',
    link: '/student/timetable',
    channels: ['DASHBOARD', 'EMAIL'],
    emailSubject: 'Timetable Update',
  });
}

export async function notifyNewMessage(userId: string, senderName: string, messageId: string) {
  return createNotification({
    userId,
    title: `New message from ${senderName}`,
    message: `You have received a new message from ${senderName}.`,
    type: 'MESSAGE',
    priority: 'NORMAL',
    link: `/student/messages/${messageId}`,
    entityType: 'MESSAGE',
    entityId: messageId,
    channels: ['DASHBOARD'],
  });
}

export async function notifyExamDeadlineReminder(userId: string, examTitle: string, deadline: string, examId: string) {
  return createNotification({
    userId,
    title: 'Exam Deadline Approaching',
    message: `The deadline for "${examTitle}" is approaching. Deadline: ${deadline}`,
    type: 'REMINDER',
    priority: 'URGENT',
    link: `/student/cbt/${examId}`,
    entityType: 'EXAM',
    entityId: examId,
    channels: ['DASHBOARD', 'EMAIL', 'SMS'],
    emailSubject: `Deadline Reminder: ${examTitle}`,
    smsContent: `Reminder: "${examTitle}" deadline is ${deadline}. Don't miss it!`,
  });
}

export async function notifyAnnouncement(userId: string, title: string, announcementId: string) {
  return createNotification({
    userId,
    title: `Announcement: ${title}`,
    message: 'A new announcement has been posted. Click to read more.',
    type: 'ANNOUNCEMENT',
    priority: 'IMPORTANT',
    link: `/student/news/${announcementId}`,
    entityType: 'ANNOUNCEMENT',
    entityId: announcementId,
    channels: ['DASHBOARD', 'EMAIL'],
    emailSubject: `New Announcement: ${title}`,
  });
}
