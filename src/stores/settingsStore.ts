import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  discordWebhookUrl: string;
  setDiscordWebhookUrl: (url: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      discordWebhookUrl: '',
      setDiscordWebhookUrl: (url) => set({ discordWebhookUrl: url }),
    }),
    {
      name: 'los-vagos-settings',
    }
  )
);
