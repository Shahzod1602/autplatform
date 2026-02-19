import { t, type TranslationKey } from "./i18n";

export function useT() {
  return (key: TranslationKey) => t[key];
}
