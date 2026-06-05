import { useState, useEffect } from 'react';
import { Settings } from '../Types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Could not fetch settings", err));
  }, []);

  return settings;
}
