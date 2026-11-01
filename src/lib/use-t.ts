"use client";

import { getTranslation, type TranslationKey } from "./i18n";
import { usePreferences } from "./use-preferences";

export function useT() {
  const { lang } = usePreferences();
  const dict = getTranslation(lang);
  return (key: TranslationKey) => dict[key];
}
