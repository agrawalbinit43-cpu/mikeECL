"use client";

import { useState } from "react";
import {
  ECL_THEMES,
  getEclTheme,
  setEclTheme,
  type EclTheme,
} from "@/app/lib/theme";
import { useUserProfile } from "@/app/contexts/UserProfileContext";
import { userFacingApiError } from "@/app/lib/userFacingError";
import {
  SettingsDescription,
  SettingsLabel,
} from "@/app/components/settings/SettingsText";
import { GlassCardUI, ToggleSwitchUI } from "@mike/ui";
import { SettingsHeading } from "@/app/components/settings/SettingsHeading";
import { SettingsRow } from "@/app/components/settings/SettingsRow";

export default function AppearancePage() {
  const { profile, updateDarkMode } = useUserProfile();
  const [theme, setTheme] = useState<EclTheme>(() => getEclTheme());
  const [savingDarkMode, setSavingDarkMode] = useState(false);
  const [darkModeError, setDarkModeError] = useState<string | null>(null);

  if (!profile) return null;

  const handleDarkModeToggle = async (enabled: boolean) => {
    if (savingDarkMode) return;
    setSavingDarkMode(true);
    setDarkModeError(null);
    try {
      await updateDarkMode(enabled);
    } catch (toggleError) {
      setDarkModeError(
        userFacingApiError(
          toggleError,
          "Could not update the appearance setting.",
        ),
      );
    } finally {
      setSavingDarkMode(false);
    }
  };

  return (
    <section className="space-y-3">
      <SettingsHeading id="appearance">Appearance</SettingsHeading>
      <GlassCardUI>
        <SettingsRow>
          <div className="min-w-0 space-y-1">
            <SettingsLabel>Theme</SettingsLabel>
            <SettingsDescription>
              Pick the look of ECL AI. The AI theme is always dark.
            </SettingsDescription>
          </div>
          <div role="radiogroup" aria-label="Theme" className="flex flex-wrap gap-2">
            {ECL_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={theme === t.id}
                title={t.blurb}
                onClick={() => {
                  setEclTheme(t.id);
                  setTheme(t.id);
                }}
                className={`h-10 rounded-md border px-3 text-sm transition-colors ${
                  theme === t.id
                    ? "border-ecl-gold bg-ecl-maroon text-ecl-paper"
                    : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </SettingsRow>
        <SettingsRow>
          <div className="min-w-0 space-y-1">
            <SettingsLabel>Dark mode</SettingsLabel>
            <SettingsDescription>
              Use a darker color palette throughout ECL AI.
            </SettingsDescription>
            {darkModeError && (
              <p role="alert" className="text-xs text-red-600">
                {darkModeError}
              </p>
            )}
          </div>
          <ToggleSwitchUI
            checked={profile.darkMode === true}
            disabled={savingDarkMode}
            aria-busy={savingDarkMode}
            aria-label="Dark mode"
            onCheckedChange={(checked) => void handleDarkModeToggle(checked)}
          />
        </SettingsRow>
      </GlassCardUI>
    </section>
  );
}
