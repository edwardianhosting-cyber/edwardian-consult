import prisma from '../lib/prisma';
import { getEnglishExamBlueprint } from './exam-blueprint.service';

export const GROUP_TYPES = {
  STANDALONE: 'STANDALONE',
  COMPREHENSION: 'COMPREHENSION',
  CLOZE: 'CLOZE',
  LITERATURE: 'LITERATURE',
  GRAMMAR: 'GRAMMAR',
  LEXIS: 'LEXIS',
  ORAL_ENGLISH: 'ORAL_ENGLISH',
  STRESS: 'STRESS',
  SOUNDS: 'SOUNDS',
} as const;

export type GroupType = typeof GROUP_TYPES[keyof typeof GROUP_TYPES];

export interface CreateQuestionGroupParams {
  subject: string;
  examType: string;
  groupType: GroupType;
  title?: string;
  instructions?: string;
  passage?: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface CreateGroupedQuestionParams {
  subject: string;
  examType: string;
  groupType: GroupType;
  groupId?: string;
  groupOrder?: number;
  topic?: string;
  text: string;
  imageUrl?: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

export async function createQuestionGroup(params: CreateQuestionGroupParams) {
  return prisma.questionGroup.create({
    data: {
      subject: params.subject,
      examType: params.examType,
      groupType: params.groupType,
      title: params.title || null,
      instructions: params.instructions || null,
      passage: params.passage || null,
      imageUrl: params.imageUrl || null,
      order: params.order || 0,
      isActive: true,
    },
  });
}

export async function getQuestionGroups(filters: {
  subject?: string;
  examType?: string;
  groupType?: GroupType;
  isActive?: boolean;
}) {
  const where: any = {};
  if (filters.subject) where.subject = filters.subject;
  if (filters.examType) where.examType = filters.examType;
  if (filters.groupType) where.groupType = filters.groupType;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  return prisma.questionGroup.findMany({
    where,
    orderBy: { order: 'asc' },
    include: {
      questions: {
        where: { isActive: true },
        orderBy: { groupOrder: 'asc' },
      },
    },
  });
}

export async function getQuestionGroupById(id: string) {
  return prisma.questionGroup.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { groupOrder: 'asc' },
      },
    },
  });
}

export async function updateQuestionGroup(id: string, data: Partial<CreateQuestionGroupParams>) {
  return prisma.questionGroup.update({
    where: { id },
    data: {
      ...(data.subject !== undefined && { subject: data.subject }),
      ...(data.examType !== undefined && { examType: data.examType }),
      ...(data.groupType !== undefined && { groupType: data.groupType }),
      ...(data.title !== undefined && { title: data.title || null }),
      ...(data.instructions !== undefined && { instructions: data.instructions || null }),
      ...(data.passage !== undefined && { passage: data.passage || null }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

export async function deleteQuestionGroup(id: string) {
  return prisma.questionGroup.delete({
    where: { id },
  });
}

export async function addQuestionToGroup(groupId: string, questionId: string, order: number) {
  return prisma.question.update({
    where: { id: questionId },
    data: {
      groupId,
      groupOrder: order,
      groupType: (await prisma.questionGroup.findUnique({ where: { id: groupId } }))?.groupType || undefined,
    },
  });
}

export async function removeQuestionFromGroup(questionId: string) {
  return prisma.question.update({
    where: { id: questionId },
    data: {
      groupId: null,
      groupOrder: null,
      groupType: null,
    },
  });
}

export async function reorderQuestionsInGroup(groupId: string, questionIds: string[]) {
  await prisma.$transaction(
    questionIds.map((qid, index) =>
      prisma.question.update({
        where: { id: qid },
        data: { groupOrder: index + 1 },
      })
    )
  );
}

export async function getGroupedExamQuestionsForEnglish(params: {
  examType: string;
  totalQuestions?: number;
  comprehensionGroupCount?: number;
  clozeGroupCount?: number;
}) {
  const blueprint = await getEnglishExamBlueprint();
  const examType = params.examType;
  const totalQuestions = params.totalQuestions ?? blueprint.totalQuestions;
  const comprehensionGroupCount = params.comprehensionGroupCount ?? blueprint.comprehensionGroupCount;
  const clozeGroupCount = params.clozeGroupCount ?? blueprint.clozeGroupCount;

  const blocks: Array<{
    type: 'COMPREHENSION' | 'CLOZE' | 'STANDALONE';
    groupId?: string;
    questions: Array<{
      id: string;
      text: string;
      imageUrl?: string;
      options: string[];
      correctOption: number;
      topic?: string;
      explanation?: string;
      groupType: string;
      groupId?: string;
      groupOrder?: number;
      passage?: string;
      title?: string;
      instructions?: string;
    }>;
  }> = [];

  const selectedGroupIds = new Set<string>();
  const usedQuestions = new Set<string>();

  if (comprehensionGroupCount > 0) {
    const comprehensionGroups = await prisma.questionGroup.findMany({
      where: {
        subject: 'English Language',
        examType,
        groupType: 'COMPREHENSION',
        isActive: true,
      },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { groupOrder: 'asc' },
        },
      },
    });

    const eligibleGroups = comprehensionGroups.filter(g => g.questions.length > 0);
    const shuffledGroups = shuffleArray([...eligibleGroups]);

    for (let i = 0; i < Math.min(comprehensionGroupCount, shuffledGroups.length); i++) {
      const group = shuffledGroups[i];
      selectedGroupIds.add(group.id);

      const questions = group.questions
        .filter(q => !usedQuestions.has(q.id))
        .map(q => {
          usedQuestions.add(q.id);
          return {
            id: q.id,
            text: q.text,
            imageUrl: q.imageUrl || undefined,
            options: q.options as string[],
            correctOption: q.correctOption,
            topic: q.topic || undefined,
            explanation: q.explanation || undefined,
            groupType: 'COMPREHENSION',
            groupId: group.id,
            groupOrder: q.groupOrder || undefined,
            passage: group.passage || undefined,
            title: group.title || undefined,
            instructions: group.instructions || undefined,
          };
        });

      if (questions.length > 0) {
        blocks.push({
          type: 'COMPREHENSION',
          groupId: group.id,
          questions,
        });
      }
    }
  }

  if (clozeGroupCount > 0) {
    const clozeGroups = await prisma.questionGroup.findMany({
      where: {
        subject: 'English Language',
        examType,
        groupType: 'CLOZE',
        isActive: true,
      },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { groupOrder: 'asc' },
        },
      },
    });

    const eligibleGroups = clozeGroups.filter(g => g.questions.length > 0);
    const shuffledGroups = shuffleArray([...eligibleGroups]);

    for (let i = 0; i < Math.min(clozeGroupCount, shuffledGroups.length); i++) {
      const group = shuffledGroups[i];
      selectedGroupIds.add(group.id);

      const questions = group.questions
        .filter(q => !usedQuestions.has(q.id))
        .map(q => {
          usedQuestions.add(q.id);
          return {
            id: q.id,
            text: q.text,
            imageUrl: q.imageUrl || undefined,
            options: q.options as string[],
            correctOption: q.correctOption,
            topic: q.topic || undefined,
            explanation: q.explanation || undefined,
            groupType: 'CLOZE',
            groupId: group.id,
            groupOrder: q.groupOrder || undefined,
            passage: group.passage || undefined,
            title: group.title || undefined,
            instructions: group.instructions || undefined,
          };
        });

      if (questions.length > 0) {
        blocks.push({
          type: 'CLOZE',
          groupId: group.id,
          questions,
        });
      }
    }
  }

  const groupedQuestionCount = blocks.reduce((sum, block) => sum + block.questions.length, 0);
  const remaining = totalQuestions - groupedQuestionCount;

  if (remaining > 0) {
    const standaloneQuestions = await prisma.question.findMany({
      where: {
        subject: 'English Language',
        examType,
        isActive: true,
        OR: [
          { groupType: null },
          { groupType: 'STANDALONE' },
        ],
        id: { notIn: [...usedQuestions] },
      },
      take: remaining * 3,
    });

    const shuffled = shuffleArray([...standaloneQuestions]);
    const selected = shuffled.slice(0, remaining);

    const standaloneBlock = selected.map(q => ({
      id: q.id,
      text: q.text,
      imageUrl: q.imageUrl || undefined,
      options: q.options as string[],
      correctOption: q.correctOption,
      topic: q.topic || undefined,
      explanation: q.explanation || undefined,
      groupType: 'STANDALONE' as const,
      groupId: undefined,
      groupOrder: undefined,
      passage: undefined,
      title: undefined,
      instructions: undefined,
    }));

    if (standaloneBlock.length > 0) {
      blocks.push({
        type: 'STANDALONE',
        questions: standaloneBlock,
      });
    }
  }

  const shuffledComprehension = shuffleArray([...blocks.filter(b => b.type === 'COMPREHENSION')]);
  const shuffledCloze = shuffleArray([...blocks.filter(b => b.type === 'CLOZE')]);
  const shuffledStandalone = shuffleArray([...blocks.filter(b => b.type === 'STANDALONE')]);

  const orderedBlocks = [
    ...shuffledComprehension,
    ...shuffledCloze,
    ...shuffledStandalone,
  ];

  const questions = orderedBlocks.flatMap(block => block.questions);

  return {
    questions,
    selectedGroupIds: [...selectedGroupIds],
    blocks: orderedBlocks.map(block => ({
      type: block.type,
      groupId: block.groupId,
      questionCount: block.questions.length,
    })),
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
