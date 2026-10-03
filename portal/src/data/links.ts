/**
 * Hand-maintained link lists: upcoming courses, quick access and tools.
 * Add an entry to any array — the pages pick it up automatically.
 */

export interface UpcomingCourse {
  title: string;
  /** Matched against providers.ts for the logo. */
  provider: string;
  url: string;
  blurb: string;
  /** Other places to take the same course, shown as chips. */
  alsoOn?: { label: string; url: string }[];
}

/** Planned next courses, in the order they will be taken. */
export const upcomingCourses: UpcomingCourse[] = [
  {
    title: 'FastAPI for AI Engineers',
    provider: 'Analytics Vidhya',
    url: 'https://www.youtube.com/playlist?list=PLdKd-j64gDcBcn_y97FBt6pw-NzmY--20',
    blurb: 'YouTube playlist — building and deploying scalable AI APIs with FastAPI.',
  },
  {
    title: 'Net Ninja Git Crash Course',
    provider: 'Net Ninja',
    url: 'https://www.netninja.dev/courses/category/git',
    blurb: 'Git & GitHub from the basics through real-world workflows.',
    alsoOn: [
      { label: 'YouTube', url: 'https://www.youtube.com/watch?v=4okmgMzPwZ8&list=PL4cUxeGkcC9j2pbmcA93DR1A3m7VEgSxK' },
    ],
  },
  {
    title: 'Complete Agentic AI Course',
    provider: 'YouTube',
    url: 'https://www.youtube.com/watch?v=rV3HJ4LEZ7k',
    blurb: 'Krish Naik, 10 hours — LangChain, LangGraph, RAG, guardrails and evals.',
  },
  {
    title: 'Claude Code (DeepLearning.AI)',
    provider: 'DeepLearning.AI',
    url: 'https://www.deeplearning.ai/courses/claude-code-a-highly-agentic-coding-assistant',
    blurb: 'Claude Code: A Highly Agentic Coding Assistant — built with Anthropic.',
  },
  {
    title: 'Claude Architect Exam Guide',
    provider: 'GitHub',
    url: 'https://github.com/daronyondem/claude-architect-exam-guide',
    blurb: 'Community study guide for the Claude Certified Architect – Foundations exam.',
  },
];

export interface LinkItem {
  label: string;
  url: string;
  description: string;
  provider?: string;
}

export const quickAccessLinks: LinkItem[] = [
  { label: 'Anthropic Skilljar', url: 'https://anthropic.skilljar.com', description: 'All Anthropic Academy courses.', provider: 'Anthropic' },
  { label: 'Claude Partner Network', url: 'https://www.anthropic.com/news/claude-partner-network', description: 'Partner program, training and certification.', provider: 'Anthropic' },
  { label: 'Claude Code docs', url: 'https://code.claude.com/docs', description: 'Skills, plugins, hooks, permissions, settings, subagents.', provider: 'Anthropic' },
  { label: 'Claude Platform docs', url: 'https://platform.claude.com/docs', description: 'API, Agent SDK and Agent Skills.', provider: 'Anthropic' },
];

export const tools: LinkItem[] = [
  {
    label: 'ccstatusline',
    url: 'https://github.com/sirmalloc/ccstatusline',
    description: 'Customizable status line for Claude Code — model, git branch, token usage and more.',
    provider: 'GitHub',
  },
  {
    label: 'anthropics/skills',
    url: 'https://github.com/anthropics/skills',
    description: "Anthropic's public skills repo — reference implementations.",
    provider: 'GitHub',
  },
];
