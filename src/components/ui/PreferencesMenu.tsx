"use client";

import { Contrast, Gauge, Maximize2, Moon, Palette, Sparkles, Sun, SunMoon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger, Segmented, Switch, Tooltip } from "@/components/kit";
import { THEMES, type ThemeId, type MotionLevel } from "@/lib/preferences";
import { preferenceActions, usePreferences } from "@/lib/use-preferences";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";

const THEME_ICON: Record<ThemeId, typeof Sun> = { study: Moon, light: Sun, night: SunMoon, contrast: Contrast };

const SWATCH: Record<ThemeId, string[]> = {
  study: ["#0b1020", "#7c6dff", "#22d3ee"],
  light: ["#f6f5f0", "#5b4ae4", "#0e7490"],
  night: ["#120e09", "#e8a54b", "#d8b46e"],
  contrast: ["#000000", "#b9adff", "#00ffff"],
};

export default function PreferencesMenu() {
  const prefs = usePreferences();
  const t = useT();
  const ActiveIcon = THEME_ICON[prefs.theme];

  return (
    <Popover>
      <Tooltip content={`${t("theme")} & ${t("focusMode").toLowerCase()}`}>
        <PopoverTrigger
          aria-label="Display preferences"
          className="inline-flex size-9 items-center justify-center rounded-xl border border-line bg-surface-2 text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
        >
          <ActiveIcon className="size-4" />
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent className="w-[22rem] space-y-4">
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">
            <Palette className="size-3.5" /> {t("theme")}
          </h2>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("theme")}>
            {THEMES.map((theme) => {
              const Icon = THEME_ICON[theme.id];
              const active = prefs.theme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => preferenceActions.setTheme(theme.id)}
                  className={cn(
                    "group rounded-2xl border-2 p-2.5 text-left transition-all",
                    active ? "border-brand bg-brand-soft" : "border-line hover:border-line-strong"
                  )}
                >
                  <div className="mb-2 flex h-9 overflow-hidden rounded-lg border border-line">
                    {SWATCH[theme.id].map((c) => (
                      <span key={c} className="flex-1" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                    <Icon className="size-3.5" /> {theme.label}
                  </div>
                  <div className="text-[11px] text-ink-3">{theme.hint}</div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="space-y-3 border-t border-line pt-3">
          <Row icon={<SunMoon className="size-4" />} label={t("nightAuto")}>
            <Switch checked={prefs.nightAuto} onCheckedChange={preferenceActions.setNightAuto} aria-label={t("nightAuto")} />
          </Row>
          <Row icon={<Maximize2 className="size-4" />} label={t("focusMode")}>
            <Switch checked={prefs.focus} onCheckedChange={preferenceActions.setFocus} aria-label={t("focusMode")} />
          </Row>
          <Row icon={<Gauge className="size-4" />} label={t("dataSaver")}>
            <Switch checked={prefs.saver} onCheckedChange={preferenceActions.setSaver} aria-label={t("dataSaver")} />
          </Row>
        </div>

        <div className="space-y-2 border-t border-line pt-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-2">
            <Sparkles className="size-4 text-ink-3" /> {t("motion")}
          </div>
          <Segmented<MotionLevel | "auto">
            layoutId="pref-motion"
            ariaLabel={t("motion")}
            className="w-full"
            value={prefs.motionOverride ?? "auto"}
            onValueChange={(v) => preferenceActions.setMotion(v === "auto" ? null : v)}
            options={[
              { value: "auto", label: "Auto" },
              { value: "full", label: "Full" },
              { value: "reduced", label: "Calm" },
              { value: "off", label: "Off" },
            ]}
          />
        </div>

        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-xs font-bold text-ink-2">Language / भाषा</span>
          <Segmented
            layoutId="pref-lang"
            ariaLabel="Language"
            value={prefs.lang}
            onValueChange={preferenceActions.setLang}
            options={[
              { value: "en", label: "EN" },
              { value: "hi", label: <span className="font-hindi">हिन्दी</span> },
            ]}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-xs font-bold text-ink-2">
        <span className="text-ink-3">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}
