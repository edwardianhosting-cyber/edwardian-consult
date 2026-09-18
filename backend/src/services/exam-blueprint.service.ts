import prisma from '../lib/prisma';

export interface EnglishExamBlueprint {
  totalQuestions: number;
  comprehensionGroupCount: number;
  clozeGroupCount: number;
  standaloneCount: number;
}

const DEFAULT_BLUEPRINT: EnglishExamBlueprint = {
  totalQuestions: 60,
  comprehensionGroupCount: 1,
  clozeGroupCount: 1,
  standaloneCount: 58,
};

const BLUEPRINT_KEY = 'english_exam_blueprint';

export async function getEnglishExamBlueprint(): Promise<EnglishExamBlueprint> {
  const setting = await prisma.settings.findUnique({
    where: { key: BLUEPRINT_KEY },
  });

  if (!setting) {
    await prisma.settings.create({
      data: {
        key: BLUEPRINT_KEY,
        value: JSON.stringify(DEFAULT_BLUEPRINT),
      },
    });
    return DEFAULT_BLUEPRINT;
  }

  try {
    return JSON.parse(setting.value) as EnglishExamBlueprint;
  } catch {
    return DEFAULT_BLUEPRINT;
  }
}

export async function updateEnglishExamBlueprint(blueprint: Partial<EnglishExamBlueprint>): Promise<EnglishExamBlueprint> {
  const current = await getEnglishExamBlueprint();
  const updated = { ...current, ...blueprint };

  await prisma.settings.upsert({
    where: { key: BLUEPRINT_KEY },
    update: { value: JSON.stringify(updated) },
    create: {
      key: BLUEPRINT_KEY,
      value: JSON.stringify(updated),
    },
  });

  return updated;
}
