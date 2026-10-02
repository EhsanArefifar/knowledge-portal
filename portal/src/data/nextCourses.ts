/**
 * Ordered list of planned next courses shown on the Homepage and /next-courses page.
 * Requirement 11.1 — exactly these five titles, in this order.
 */
export const nextCourses = [
  'FastAPI for AI Engineers',
  'Net Ninja Git Crash Course',
  'Complete Agentic AI Course',
  'Claude Code (DeepLearning.AI)',
  'Claude Architect Exam Guide',
] as const;

/** Type representing any valid next-course title. */
export type NextCourse = (typeof nextCourses)[number];
