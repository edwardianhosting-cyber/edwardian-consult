import { prisma } from '../lib/prisma';

interface CreateCareerParams {
  title: string;
  description: string;
  requiredSubjects: string[];
  relatedCourses: string[];
  overview?: string;
  requirements?: string;
  skills?: string;
  workEnvironment?: string;
  salaryRange?: string;
  growthProspect?: string;
  suitability?: string;
}

export async function createCareer(params: CreateCareerParams) {
  return prisma.career.create({
    data: {
      title: params.title,
      description: params.description,
      requiredSubjects: params.requiredSubjects as any,
      relatedCourses: params.relatedCourses as any,
      overview: params.overview,
      requirements: params.requirements,
      skills: params.skills,
      workEnvironment: params.workEnvironment,
      salaryRange: params.salaryRange,
      growthProspect: params.growthProspect,
      suitability: params.suitability,
    },
  });
}

export async function getCareers() {
  return prisma.career.findMany({
    where: { isActive: true },
    orderBy: { title: 'asc' },
  });
}

export async function getCareerById(id: string) {
  return prisma.career.findUnique({
    where: { id },
  });
}

export async function updateCareer(id: string, params: Partial<CreateCareerParams>) {
  return prisma.career.update({
    where: { id },
    data: {
      ...params,
      requiredSubjects: params.requiredSubjects as any,
      relatedCourses: params.relatedCourses as any,
    },
  });
}

export async function deleteCareer(id: string) {
  return prisma.career.delete({
    where: { id },
  });
}

export async function matchCareers(subjects: string[]) {
  const careers = await prisma.career.findMany({
    where: { isActive: true },
  });

  return careers
    .map(career => {
      const requiredSubjects = Array.isArray(career.requiredSubjects)
        ? career.requiredSubjects
        : (career.requiredSubjects ? JSON.parse(JSON.stringify(career.requiredSubjects)) : []);
      
      const matchCount = requiredSubjects.filter((s: string) => 
        subjects.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
      ).length;
      const matchPercent = requiredSubjects.length > 0 ? (matchCount / requiredSubjects.length) * 100 : 0;
      
      return {
        ...career,
        requiredSubjects,
        matchPercent: Math.round(matchPercent),
        matchedSubjects: requiredSubjects.filter((s: string) => 
          subjects.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
        ),
      };
    })
    .filter(c => c.matchPercent > 0)
    .sort((a, b) => b.matchPercent - a.matchPercent);
}

export async function initializeCareers() {
  const careers = [
    {
      title: 'Software Engineer',
      description: 'Design and develop software applications and systems',
      requiredSubjects: ['Mathematics', 'Physics', 'Technology'],
      relatedCourses: ['Computer Science', 'Software Engineering', 'Information Technology'],
      overview: 'Software engineers design, develop, and maintain software systems. They work in various industries including tech, finance, healthcare, and more.',
      requirements: 'Strong foundation in Mathematics and Physics. Proficiency in programming languages like Python, Java, or JavaScript.',
      skills: 'Problem-solving, logical thinking, attention to detail, teamwork, communication',
      workEnvironment: 'Office-based, remote, or hybrid. Varied hours depending on project deadlines.',
      salaryRange: '₦200,000 - ₦1,500,000 per month',
      growthProspect: 'High demand globally. Opportunities for specialization in AI, cybersecurity, mobile development, etc.',
      suitability: 'You are suited if you enjoy solving puzzles, working with computers, and learning new technologies. If you spend free time building apps or websites, this could be your path.',
    },
    {
      title: 'Doctor',
      description: 'Diagnose and treat illnesses and injuries',
      requiredSubjects: ['Biology', 'Chemistry', 'Physics', 'Mathematics'],
      relatedCourses: ['Medicine', 'Surgery', 'Medical Sciences'],
      overview: 'Doctors diagnose and treat illnesses, provide preventive care, and educate patients about health conditions.',
      requirements: 'Excellent grades in Biology, Chemistry, Physics, and Mathematics. Strong memory and analytical skills.',
      skills: 'Empathy, communication, decision-making, stamina, attention to detail, ethical judgment',
      workEnvironment: 'Hospitals, clinics, research labs. Long and irregular hours including nights and weekends.',
      salaryRange: '₦300,000 - ₦2,000,000 per month',
      growthProspect: 'Specialization opportunities in surgery, pediatrics, cardiology, etc. Can also move into research or administration.',
      suitability: 'You are suited if you have a passion for helping people, strong science aptitude, and can handle high-pressure situations. If you enjoy biology and chemistry and want a career with direct impact on lives, consider medicine.',
    },
    {
      title: 'Civil Engineer',
      description: 'Design and oversee construction of infrastructure projects',
      requiredSubjects: ['Mathematics', 'Physics', 'Technology'],
      relatedCourses: ['Civil Engineering', 'Structural Engineering', 'Construction Management'],
      overview: 'Civil engineers design, build, and maintain infrastructure projects like roads, bridges, and buildings.',
      requirements: 'Strong background in Mathematics and Physics. Spatial awareness and technical drawing skills.',
      skills: 'Project management, problem-solving, teamwork, technical drawing, attention to safety',
      workEnvironment: 'Construction sites, offices, field inspections. Outdoor work in various weather conditions.',
      salaryRange: '₦150,000 - ₦800,000 per month',
      growthProspect: 'Steady demand due to infrastructure development. Can specialize in structural, environmental, or geotechnical engineering.',
      suitability: 'You are suited if you enjoy building things, understanding how structures work, and managing projects. If you like Mathematics and Physics and want to see tangible results of your work, civil engineering is a great fit.',
    },
    {
      title: 'Accountant',
      description: 'Manage financial records and ensure compliance',
      requiredSubjects: ['Mathematics', 'Economics'],
      relatedCourses: ['Accounting', 'Finance', 'Business Administration'],
      overview: 'Accountants prepare and examine financial records, ensure taxes are paid properly, and help organizations run efficiently.',
      requirements: 'Good command of Mathematics and Economics. Attention to detail and understanding of business principles.',
      skills: 'Analytical thinking, accuracy, organization, ethics, communication, proficiency with accounting software',
      workEnvironment: 'Offices, audit firms, corporate finance departments. Standard business hours with occasional overtime during tax season.',
      salaryRange: '₦100,000 - ₦500,000 per month',
      growthProspect: 'Can advance to senior accountant, financial manager, or start your own accounting firm. Professional certifications like ICAN enhance prospects.',
      suitability: 'You are suited if you are good with numbers, organized, and detail-oriented. If you enjoy working with data, following rules, and helping businesses stay financially healthy, accounting may be right for you.',
    },
    {
      title: 'Lawyer',
      description: 'Represent clients in legal matters and provide counsel',
      requiredSubjects: ['English', 'Government', 'Literature'],
      relatedCourses: ['Law', 'Legal Studies', 'Civil Law'],
      overview: 'Lawyers advise and represent clients in legal matters, draft legal documents, and argue cases in court.',
      requirements: 'Excellent command of English, strong analytical skills, knowledge of Government and civic matters.',
      skills: 'Public speaking, research, writing, critical thinking, negotiation, persuasion',
      workEnvironment: 'Law firms, courts, corporate legal departments. Can involve extensive travel and long hours.',
      salaryRange: '₦150,000 - ₦1,200,000 per month',
      growthProspect: 'Can specialize in corporate law, criminal law, human rights, or intellectual property. Can become a judge or legal consultant.',
      suitability: 'You are suited if you are articulate, enjoy debate, can argue both sides of an issue, and have a strong sense of justice. If English and Government are your strengths and you want to advocate for people, law is a strong choice.',
    },
    {
      title: 'Data Scientist',
      description: 'Analyze complex data to help organizations make decisions',
      requiredSubjects: ['Mathematics', 'Statistics', 'Computer Science'],
      relatedCourses: ['Data Science', 'Statistics', 'Computer Science'],
      overview: 'Data scientists use statistical and computational methods to extract insights from data and guide business decisions.',
      requirements: 'Strong foundation in Mathematics and Statistics. Programming skills in Python or R.',
      skills: 'Statistical analysis, machine learning, data visualization, programming, business acumen',
      workEnvironment: 'Tech companies, research institutions, consulting firms. Mostly office-based with flexible hours.',
      salaryRange: '₦250,000 - ₦1,000,000 per month',
      growthProspect: 'One of the fastest-growing careers. Opportunities in AI, machine learning, business intelligence, and healthcare analytics.',
      suitability: 'You are suited if you love numbers, patterns, and solving complex problems. If you enjoy Mathematics and Computer Science and want to work at the cutting edge of technology, data science is ideal.',
    },
    {
      title: 'Pharmacist',
      description: 'Dispense medications and provide pharmaceutical care',
      requiredSubjects: ['Chemistry', 'Biology', 'Mathematics'],
      relatedCourses: ['Pharmacy', 'Pharmaceutical Sciences'],
      overview: 'Pharmacists dispense medications, advise patients on their use, and monitor drug interactions.',
      requirements: 'Strong grades in Chemistry and Biology. Good memory for drug names and dosages.',
      skills: 'Attention to detail, communication, ethics, chemistry knowledge, customer service',
      workEnvironment: 'Pharmacies, hospitals, pharmaceutical companies. Shift work may be required.',
      salaryRange: '₦120,000 - ₦600,000 per month',
      growthProspect: 'Can work in retail, hospital, or industrial pharmacy. Opportunities in research, sales, and regulatory affairs.',
      suitability: 'You are suited if you are meticulous, interested in chemistry and health, and enjoy helping people manage their medications. If you want a stable career with direct community impact, pharmacy is excellent.',
    },
    {
      title: 'Architect',
      description: 'Design buildings and structures',
      requiredSubjects: ['Mathematics', 'Physics', 'Technical Drawing'],
      relatedCourses: ['Architecture', 'Architectural Technology'],
      overview: 'Architects design buildings and structures, considering aesthetics, functionality, and safety.',
      requirements: 'Strong Mathematics and Physics background. Proficiency in Technical Drawing and design software.',
      skills: 'Creativity, spatial awareness, project management, communication, attention to detail',
      workEnvironment: 'Architecture firms, construction sites, own practice. Mix of office and site work.',
      salaryRange: '₦150,000 - ₦900,000 per month',
      growthProspect: 'Can become a licensed architect, urban planner, or interior designer. Opportunities in sustainable and green building design.',
      suitability: 'You are suited if you are creative, good at visualizing spaces, and interested in how things are built. If you enjoy art, Mathematics, and Technical Drawing and want to shape the physical world, architecture is a great path.',
    },
  ];

  for (const career of careers) {
    await prisma.career.upsert({
      where: { title: career.title },
      update: {
        ...career,
        requiredSubjects: career.requiredSubjects as any,
        relatedCourses: career.relatedCourses as any,
      },
      create: {
        ...career,
        requiredSubjects: career.requiredSubjects as any,
        relatedCourses: career.relatedCourses as any,
      },
    });
  }
}
