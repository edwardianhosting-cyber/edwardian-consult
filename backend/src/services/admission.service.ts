import { prisma } from '../lib/prisma';

interface CreateInstitutionParams {
  name: string;
  abbreviation?: string;
  type: string;
  location?: string;
  state?: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  description?: string;
}

export async function createInstitution(params: CreateInstitutionParams) {
  return prisma.institution.create({
    data: {
      name: params.name,
      abbreviation: params.abbreviation,
      type: params.type,
      location: params.location,
      state: params.state,
      website: params.website,
      logo: params.logo,
      coverImage: params.coverImage,
      description: params.description,
    },
  });
}

export async function getInstitutions(filters?: { type?: string; state?: string }) {
  const where: any = {};
  if (filters?.type) where.type = filters.type;
  if (filters?.state) where.state = filters.state;

  return prisma.institution.findMany({
    where,
    include: { courses: true },
    orderBy: { name: 'asc' },
  });
}

export async function updateInstitution(id: string, data: Partial<CreateInstitutionParams>) {
  return prisma.institution.update({
    where: { id },
    data,
  });
}

export async function deleteInstitution(id: string) {
  return prisma.institution.delete({ where: { id } });
}

interface CreateCourseParams {
  institutionId: string;
  name: string;
  utmeCutoff?: number;
  olevelRequirements?: string;
  jambSubjects?: string[];
  postUtmeRequired?: boolean;
  postUtmeCutoff?: number;
  applicationFee?: number;
  deadline?: Date;
  coverImage?: string;
  description?: string;
}

export async function createInstitutionCourse(params: CreateCourseParams) {
  return prisma.institutionCourse.create({
    data: {
      institutionId: params.institutionId,
      name: params.name,
      utmeCutoff: params.utmeCutoff,
      olevelRequirements: params.olevelRequirements,
      jambSubjects: params.jambSubjects || undefined,
      postUtmeRequired: params.postUtmeRequired ?? false,
      postUtmeCutoff: params.postUtmeCutoff,
      applicationFee: params.applicationFee,
      deadline: params.deadline,
      coverImage: params.coverImage,
      description: params.description,
    },
  });
}

export async function getAllInstitutionCourses(filters?: { institutionId?: string; search?: string }) {
  const where: any = {};
  if (filters?.institutionId) where.institutionId = filters.institutionId;
  if (filters?.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }

  return prisma.institutionCourse.findMany({
    where,
    include: { institution: true },
    orderBy: { id: 'desc' },
  });
}

export async function updateInstitutionCourse(id: string, data: Partial<CreateCourseParams>) {
  return prisma.institutionCourse.update({
    where: { id },
    data,
  });
}

export async function deleteInstitutionCourse(id: string) {
  return prisma.institutionCourse.delete({ where: { id } });
}

export async function matchInstitutions(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const utmeScore = parseInt(user.targetScore || '0');
  const targetCourse = user.targetCourse;

  const courses = await prisma.institutionCourse.findMany({
    where: {
      isActive: true,
      ...(targetCourse ? { name: { contains: targetCourse, mode: 'insensitive' } } : {}),
    },
    include: { institution: true },
    orderBy: { utmeCutoff: 'asc' },
  });

  return courses.map(course => ({
    institution: {
      name: course.institution.name,
      abbreviation: course.institution.abbreviation,
      type: course.institution.type,
      location: course.institution.location,
      state: course.institution.state,
      logo: course.institution.logo,
      coverImage: course.institution.coverImage,
    },
    course: course.name,
    utmeCutoff: course.utmeCutoff,
    meetsRequirement: utmeScore >= (course.utmeCutoff || 0),
    olevelRequirements: course.olevelRequirements,
    jambSubjects: course.jambSubjects,
    postUtmeRequired: course.postUtmeRequired,
    postUtmeCutoff: course.postUtmeCutoff,
    applicationFee: course.applicationFee,
    deadline: course.deadline,
    coverImage: course.coverImage,
    description: course.description,
  }));
}

export async function checkCourseEligibility(userId: string, courseName: string, utmeScore: number, olevelResults: any[]) {
  const courses = await prisma.institutionCourse.findMany({
    where: {
      name: { contains: courseName, mode: 'insensitive' },
      isActive: true,
    },
    include: { institution: true },
  });

  return courses.map(course => {
    const meetsUtme = utmeScore >= (course.utmeCutoff || 0);
    const olevelCount = olevelResults.filter((r: any) => ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].includes(r.grade)).length;
    const meetsOlevel = olevelCount >= 5;

    return {
      institution: course.institution.name,
      course: course.name,
      eligible: meetsUtme && meetsOlevel,
      meetsUtmeRequirement: meetsUtme,
      meetsOlevelRequirement: meetsOlevel,
      utmeCutoff: course.utmeCutoff,
      yourUtmeScore: utmeScore,
      requiredSubjects: course.jambSubjects,
    };
  });
}

export async function createAdmissionApplication(userId: string, data: {
  institutionId: string;
  courseId: string;
  choiceNumber?: number;
  utmeScore?: number;
  olevelResults?: any[];
}) {
  return prisma.admissionApplication.create({
    data: {
      userId,
      institutionId: data.institutionId,
      courseId: data.courseId,
      choiceNumber: data.choiceNumber,
      utmeScore: data.utmeScore,
      olevelResults: data.olevelResults || undefined,
      status: 'DRAFT',
    },
  });
}

export async function getAllApplications(filters?: { status?: string; search?: string; page?: number; limit?: number }) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters?.status) where.status = filters.status;

  const [applications, total] = await Promise.all([
    prisma.admissionApplication.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        institution: { select: { id: true, name: true, abbreviation: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.admissionApplication.count({ where }),
  ]);

  return {
    applications: applications.map(app => ({
      id: app.id,
      userId: app.userId,
      userName: app.user.fullName || app.user.email,
      userEmail: app.user.email,
      institutionId: app.institutionId,
      institutionName: app.institution.name,
      courseId: app.courseId,
      choiceNumber: app.choiceNumber,
      status: app.status,
      utmeScore: app.utmeScore,
      submittedAt: app.submittedAt,
      decisionAt: app.decisionAt,
      notes: app.notes,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdmissionTracker(userId: string) {
  const applications = await prisma.admissionApplication.findMany({
    where: { userId },
    include: {
      institution: { select: { name: true, abbreviation: true } },
    },
    orderBy: { choiceNumber: 'asc' },
  });

  const timeline = [
    { step: 'JAMB Registration', status: 'completed' },
    { step: 'JAMB Examination', status: 'completed' },
    { step: 'JAMB Result', status: 'completed' },
    { step: 'Post-UTME Registration', status: applications.length > 0 ? 'completed' : 'pending' },
    { step: 'Post-UTME Examination', status: 'pending' },
    { step: 'Admission List', status: 'pending' },
    { step: 'JAMB CAPS', status: 'pending' },
    { step: 'Admission Letter', status: 'pending' },
  ];

  return {
    timeline,
    applications: applications.map(app => ({
      id: app.id,
      institution: app.institution.name,
      course: app.courseId,
      choiceNumber: app.choiceNumber,
      status: app.status,
      utmeScore: app.utmeScore,
      submittedAt: app.submittedAt,
      decisionAt: app.decisionAt,
    })),
  };
}

export async function updateMyApplicationStatus(userId: string, applicationId: string, status: string) {
  const application = await prisma.admissionApplication.findFirst({
    where: { id: applicationId, userId },
  });

  if (!application) throw new Error('Application not found');

  return prisma.admissionApplication.update({
    where: { id: applicationId },
    data: {
      status,
      decisionAt: ['APPROVED', 'REJECTED', 'ADMITTED'].includes(status) ? new Date() : undefined,
    },
  });
}

export async function getAdmissionHub(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const targetCourse = user.targetCourse;

  const where: any = {
    isActive: true,
    deadline: { gte: new Date() },
  };

  if (targetCourse) {
    where.name = { contains: targetCourse, mode: 'insensitive' };
  }

  const courses = await prisma.institutionCourse.findMany({
    where,
    include: { institution: true },
    orderBy: { deadline: 'asc' },
  });

  return courses.map(course => ({
    institution: {
      name: course.institution.name,
      abbreviation: course.institution.abbreviation,
      type: course.institution.type,
      location: course.institution.location,
      state: course.institution.state,
      logo: course.institution.logo,
      coverImage: course.institution.coverImage,
    },
    course: course.name,
    utmeCutoff: course.utmeCutoff,
    applicationFee: course.applicationFee,
    deadline: course.deadline,
    postUtmeRequired: course.postUtmeRequired,
    postUtmeCutoff: course.postUtmeCutoff,
    coverImage: course.coverImage,
    description: course.description,
  }));
}

export async function updateApplicationStatus(applicationId: string, status: string, notes?: string) {
  return prisma.admissionApplication.update({
    where: { id: applicationId },
    data: {
      status,
      notes,
      decisionAt: ['APPROVED', 'REJECTED'].includes(status) ? new Date() : undefined,
    },
  });
}
