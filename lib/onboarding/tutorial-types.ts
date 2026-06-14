import { z } from "zod";

export const TutorialStepSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  stepName: z.string(),
  completed: z.boolean(),
  completedAt: z.date().nullable(),
  order: z.number(),
});

export type TutorialStep = z.infer<typeof TutorialStepSchema>;

export const TUTORIAL_STEPS = [
  { name: "tutorial_welcome", order: 0, title: "欢迎" },
  { name: "tutorial_create_content", order: 1, title: "创建内容" },
  { name: "tutorial_use_templates", order: 2, title: "使用模板" },
  { name: "tutorial_brand_voice", order: 3, title: "品牌声音" },
  { name: "tutorial_save_content", order: 4, title: "保存内容" },
  { name: "tutorial_completed", order: 5, title: "完成" },
];
