/**
 * Course providers — logo (served from public/logos), home page and brand color.
 * A course's `_course.json` `provider` value is matched against `name`.
 */
export interface Provider {
  name: string;
  logo?: string;
  url?: string;
  color: string;
}

export const providers: Provider[] = [
  { name: 'Anthropic', logo: 'logos/anthropic.png', url: 'https://anthropic.skilljar.com', color: '#d97757' },
  { name: 'Net Ninja', logo: 'logos/netninja.png', url: 'https://netninja.dev', color: '#e5484d' },
  { name: 'DeepLearning.AI', logo: 'logos/deeplearning-ai.png', url: 'https://www.deeplearning.ai', color: '#f2555a' },
  { name: 'Udemy', logo: 'logos/udemy.png', url: 'https://www.udemy.com', color: '#a435f0' },
  { name: 'Analytics Vidhya', logo: 'logos/analytics-vidhya.png', url: 'https://www.analyticsvidhya.com', color: '#2f80ed' },
  { name: 'GitHub', logo: 'logos/github.png', url: 'https://github.com', color: '#6e7681' },
];

export function getProvider(name: string): Provider {
  return (
    providers.find((p) => p.name.toLowerCase() === name.toLowerCase()) ?? {
      name,
      color: '#6366f1',
    }
  );
}
