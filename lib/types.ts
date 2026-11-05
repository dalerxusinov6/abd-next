export const CATEGORIES = ["web", "mobile", "branding", "crm"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  web: "Veb",
  mobile: "Mobil",
  branding: "Brending",
  crm: "CRM",
};

export const VISUALS = ["phone", "laptop", "logo"] as const;
export type Visual = (typeof VISUALS)[number];

export type Result = { value: string; label: string };

export type Project = {
  id: string;
  slug: string;
  name: string;
  type: string;
  category: Category;
  year: number;
  client: string;
  duration: string;
  /** Live site / store link; shows a "Saytga o'tish" button. */
  url?: string;
  description: string;
  task: string;
  solution: string;
  services: string[];
  results: Result[];
  color: string;
  accent: string;
  visual: Visual;
  logoText: string;
  cover: string | null;
  gallery: string[];
  published: boolean;
  order: number;
};

export type Client = { id: string; name: string; logo: string | null; url: string; order: number };
export type Faq = { id: string; question: string; answer: string; order: number };
export type Member = { id: string; name: string; role: string; photo: string | null; color: string; order: number };
export type Testimonial = { id: string; name: string; role: string; text: string; color: string; order: number };

export type Message = {
  id: string;
  name: string;
  phone: string;
  email: string;
  services: string[];
  budget: string;
  text: string;
  createdAt: string;
  read: boolean;
};

export type Subscriber = { email: string; createdAt: string };

export type Settings = {
  heroWords: string[];
  stats: { projects: number; clients: number; years: number; team: number };
  phone: string;
  email: string;
  telegram: string;
  address: string;
};

export type Content = {
  projects: Project[];
  clients: Client[];
  faq: Faq[];
  testimonials: Testimonial[];
  team: Member[];
  messages: Message[];
  subscribers: Subscriber[];
  settings: Settings;
};

export type ActionState = { ok: boolean; message: string } | null;
