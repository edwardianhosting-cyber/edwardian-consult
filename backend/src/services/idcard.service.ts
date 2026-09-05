import QRCode from 'qrcode';
import { prisma } from '../lib/prisma';

const SCHOOL_NAME = 'Edwardian Educational Consult';
const SCHOOL_SHORT = 'EEC';

export async function generateStudentIdCard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      documents: {
        where: { type: 'PASSPORT', status: 'VERIFIED' },
      },
    },
  });

  if (!user) throw new Error('User not found');

  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  const verificationUrl = `${process.env.FRONTEND_URL || 'https://edwardianeducationalconsult.com.ng'}/verify/student/${user.portalId}`;
  
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 2,
    color: { dark: '#2C2015', light: '#FFFFFF' },
  });

  const idCard = {
    front: {
      schoolName: SCHOOL_NAME,
      schoolShort: SCHOOL_SHORT,
      cardType: 'STUDENT ID CARD',
      passportUrl: user.avatar || user.passportUrl || user.documents[0]?.fileUrl || null,
      fullName: user.fullName,
      studentId: user.portalId,
      programme: user.programme || 'N/A',
      classLevel: user.classLevel || 'N/A',
      dateOfBirth: user.dateOfBirth ? formatDate(user.dateOfBirth) : 'N/A',
      validUntil: formatDate(validUntil),
      qrCode: qrCodeDataUrl,
      gender: user.gender || 'N/A',
      state: user.state || 'N/A',
    },
    back: {
      studentId: user.portalId,
      fullName: user.fullName,
      programme: user.programme || 'N/A',
      classLevel: user.classLevel || 'N/A',
      targetCourse: user.targetCourse || 'N/A',
      targetInstitution: user.targetInstitution || 'N/A',
      phone: user.phone,
      email: user.studentEmail || user.email,
      address: user.address || 'N/A',
      state: user.state || 'N/A',
      lga: user.lga || 'N/A',
      emergencyContact: user.parentPhone || 'N/A',
      registrationDate: formatDate(user.createdAt),
      validUntil: formatDate(validUntil),
      verificationUrl,
    },
    verification: {
      isValid: user.isActive,
      studentName: user.fullName,
      studentId: user.portalId,
      status: user.isActive ? 'Active' : 'Inactive',
      programme: user.programme || 'N/A',
    },
  };

  return idCard;
}

export async function verifyStudent(portalId: string) {
  const user = await prisma.user.findUnique({
    where: { portalId },
    select: {
      fullName: true,
      portalId: true,
      isActive: true,
      programme: true,
      role: true,
    },
  });

  if (!user || user.role !== 'STUDENT') {
    return { isValid: false, message: 'Student not found' };
  }

  return {
    isValid: user.isActive,
    studentName: user.fullName,
    studentId: user.portalId,
    status: user.isActive ? 'Active' : 'Inactive',
    programme: user.programme || 'N/A',
  };
}

export async function generateCertificate(userId: string, programme: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const certificateNumber = `EEC/${new Date().getFullYear()}/${user.portalId}`;
  const verificationUrl = `${process.env.FRONTEND_URL || 'https://edwardianeducationalconsult.com.ng'}/verify/certificate/${certificateNumber}`;
  
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 150,
    margin: 2,
  });

  const certificate = await prisma.certificate.create({
    data: {
      userId,
      certificateNumber,
      programme,
      qrCode: qrCodeDataUrl,
      metadata: {
        studentName: user.fullName,
        issueDate: new Date().toISOString(),
        directorName: 'Director of Studies',
      },
    },
  });

  return {
    certificateNumber: certificate.certificateNumber,
    studentName: user.fullName,
    programme,
    issueDate: certificate.issueDate,
    qrCode: certificate.qrCode,
    verificationUrl,
  };
}

export async function verifyCertificate(certificateNumber: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateNumber },
    include: {
      user: {
        select: { fullName: true, portalId: true },
      },
    },
  });

  if (!certificate) {
    return { isValid: false, message: 'Certificate not found' };
  }

  return {
    isValid: certificate.status === 'ACTIVE',
    certificateNumber: certificate.certificateNumber,
    studentName: certificate.user.fullName,
    programme: certificate.programme,
    issueDate: certificate.issueDate,
    status: certificate.status,
  };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
