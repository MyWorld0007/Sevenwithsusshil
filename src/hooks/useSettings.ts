import { apiFetch } from '../lib/api';
import { useState, useEffect } from 'react';
import { Settings } from '../Types';

const DEFAULT_SETTINGS: Settings = {
  id: 1,
  whatsapp: "917039516551",
  email: "7s.evolve@gmail.com",
  whatsapp_message: "Hello! I would like to book a session.",
  email_subject: "Book a Session",
  email_body: "Hi Team Seven,\n\nI want to book a session."
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(DEFAULT_SETTINGS);

  useEffect(() => {
    apiFetch('/api/settings')
      .then(async res => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        const text = await res.text();
        if (!text) throw new Error("Empty response");
        return JSON.parse(text);
      })
      .then(data => {
        if (data && data.whatsapp) {
          setSettings(data);
        }
      })
      .catch(err => {
        console.error("Could not fetch settings", err);
      });
  }, []);

  return settings;
}
