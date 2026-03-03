"use client";

import { Language } from "@/lib/types";
import { LANGUAGE_LABELS } from "@/lib/constants";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LanguageSelectorProps {
  value: Language;
  onChange: (lang: Language) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as Language)}>
      <TabsList>
        {(Object.entries(LANGUAGE_LABELS) as [Language, string][]).map(([code, label]) => (
          <TabsTrigger key={code} value={code}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
