"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n";
import { Sun, Moon, Monitor, Languages, LogOut, ChevronRight as Right, ChevronDown, Check } from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { User } from "@/types/users";

export type ThemeOption = "system" | "light" | "dark";
export type LangOption = "zh" | "en";

export interface UserModalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  initial: string;
}

export default function UserModalDialog({ open, onOpenChange, user, initial }: UserModalDialogProps) {
  const { theme, setTheme } = useTheme();
  const { t, lang, setLanguage } = useI18n();
  const { name, email } = user ?? {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle>{t("settings")}</DialogTitle>
              <DialogDescription>{t("manage")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          <div className="rounded-lg bg-muted p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">{initial}</span>
              <div>
                <div className="font-medium">{name}</div>
                <div className="text-sm text-muted-foreground">{email}</div>
              </div>
            </div>
            <Right className="text-muted-foreground" />
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">{t("general")}</div>
            <div className="rounded-lg bg-muted">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Moon /> : theme === "light" ? <Sun /> : <Monitor />}
                  <div>{t("theme")}</div>
                </div>
                <Select.Root
                  value={theme}
                  onValueChange={(val) => {
                    const v = val as ThemeOption;
                    setTheme(v);
                  }}
                >
                  <Select.Trigger aria-label="theme-select" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Select.Value />
                    <Select.Icon>
                      <ChevronDown />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="z-50 rounded-md border bg-background p-1 shadow-lg">
                      <Select.Viewport className="space-y-1">
                        <Select.Item value="system" className="flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer data-[state=checked]:bg-accent">
                          <Select.ItemIndicator>
                            <Check className="size-4" />
                          </Select.ItemIndicator>
                          <Select.ItemText>{lang === "zh" ? "跟随系统" : "System"}</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="light" className="flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer data-[state=checked]:bg-accent">
                          <Select.ItemIndicator>
                            <Check className="size-4" />
                          </Select.ItemIndicator>
                          <Select.ItemText>{lang === "zh" ? "浅色" : "Light"}</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="dark" className="flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer data-[state=checked]:bg-accent">
                          <Select.ItemIndicator>
                            <Check className="size-4" />
                          </Select.ItemIndicator>
                          <Select.ItemText>{lang === "zh" ? "深色" : "Dark"}</Select.ItemText>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Languages />
                  <div>{t("language")}</div>
                </div>
                <Select.Root
                  value={lang}
                  onValueChange={(val) => {
                    const v = val as LangOption;
                    setLanguage(v);
                  }}
                >
                  <Select.Trigger aria-label="language-select" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Select.Value />
                    <Select.Icon>
                      <ChevronDown />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="z-50 rounded-md border bg-background p-1 shadow-lg">
                      <Select.Viewport className="space-y-1">
                        <Select.Item value="zh" className="flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer data-[state=checked]:bg-accent">
                          <Select.ItemIndicator>
                            <Check className="size-4" />
                          </Select.ItemIndicator>
                          <Select.ItemText>中文</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="en" className="flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer data-[state=checked]:bg-accent">
                          <Select.ItemIndicator>
                            <Check className="size-4" />
                          </Select.ItemIndicator>
                          <Select.ItemText>English</Select.ItemText>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <div className="flex items-center gap-3">
              <LogOut />
              <div>{t("logout")}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
