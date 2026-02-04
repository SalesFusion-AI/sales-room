import { create } from 'zustand';

const MODEL_KEY = 'salesroom_ai_model';
const API_KEY = 'salesroom_ai_api_key';
const BOOKING_URL_KEY = 'salesroom_booking_url';

const getStoredValue = (key: string, fallback: string) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = localStorage.getItem(key);
    return stored ?? fallback;
  } catch (error) {
    console.warn(`Failed to access localStorage key: ${key}`, error);
    return fallback;
  }
};

const setStoredValue = (key: string, value: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to set localStorage key: ${key}`, error);
  }
};

interface SettingsStore {
  aiModel: string;
  aiApiKey: string;
  bookingUrl: string;
  setAiModel: (model: string) => void;
  setApiKey: (key: string) => void;
  setBookingUrl: (url: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  aiModel: getStoredValue(MODEL_KEY, 'GPT-4o'),
  aiApiKey: getStoredValue(API_KEY, ''),
  bookingUrl: getStoredValue(BOOKING_URL_KEY, ''),
  setAiModel: (model) => {
    set({ aiModel: model });
    setStoredValue(MODEL_KEY, model);
  },
  setApiKey: (key) => {
    set({ aiApiKey: key });
    setStoredValue(API_KEY, key);
  },
  setBookingUrl: (url) => {
    set({ bookingUrl: url });
    setStoredValue(BOOKING_URL_KEY, url);
  },
}));
