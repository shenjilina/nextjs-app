type User = {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro";
  language: "zh" | "en";
  theme: "system" | "light" | "dark";
  token?: string;
};

export type { User };
