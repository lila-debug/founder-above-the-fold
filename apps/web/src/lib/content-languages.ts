export const CONTENT_LANGUAGES = [
  { code: "en-CA", label: "English — Canada" },
  { code: "en-GB", label: "English — United Kingdom" },
  { code: "en-US", label: "English — United States" },
  { code: "en-AU", label: "English — Australia" },
  { code: "en", label: "English — my dialect" },
  { code: "fr-FR", label: "Français — France (parisien)" },
  { code: "fr-CA", label: "Français — Québec" },
] as const;

export type ContentLanguage = (typeof CONTENT_LANGUAGES)[number]["code"];

export const DEFAULT_CONTENT_LANGUAGE: ContentLanguage = "en-CA";

export function parseContentLanguage(value: unknown): ContentLanguage | null {
  return typeof value === "string" &&
    CONTENT_LANGUAGES.some((language) => language.code === value)
    ? (value as ContentLanguage)
    : null;
}

export function contentLanguageLabel(code: ContentLanguage) {
  return CONTENT_LANGUAGES.find((language) => language.code === code)?.label ?? code;
}
