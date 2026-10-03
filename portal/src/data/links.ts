/**
 * Hand-maintained link lists: upcoming courses, quick access and tools.
 * Add an entry to any array — the pages pick it up automatically.
 */

export interface UpcomingCourse {
  title: string;
  provider: string;
  url: string;
  blurb: string;
}

/** Planned next courses, in the order they will be taken. */
export const upcomingCourses: UpcomingCourse[] = [
  {
    title: 'FastAPI for AI Engineers',
    provider: 'Analytics Vidhya',
    url: 'https://www.analyticsvidhya.com/courses/fastapi-for-ai-engineers-the-complete-guide-to-building-scalable-ai-apis/',
    blurb: 'Scalable AI APIs, RAG systems and agentic backends with FastAPI.',
  },
  {
    title: 'Net Ninja Git Crash Course',
    provider: 'Net Ninja',
    url: 'https://www.netninja.dev/courses/category/git',
    blurb: 'Git & GitHub from the basics through real-world workflows.',
  },
  {
    title: 'Complete Agentic AI Course',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/the-complete-agentic-ai-engineering-course/',
    blurb: 'Agents and MCP across the OpenAI Agents SDK, CrewAI, LangGraph and AutoGen.',
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
  { label: 'Claude 101', url: 'https://anthropic.skilljar.com/claude-101', description: 'Current Anthropic Academy course.', provider: 'Anthropic' },
  { label: 'Claude Code in Action', url: 'https://anthropic.skilljar.com/claude-code-in-action', description: 'Current Anthropic Academy course.', provider: 'Anthropic' },
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
