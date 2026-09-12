import { computed, ref } from 'vue';

const sections = ref<string[]>([]);
const subjects = ref<string[]>([]);
let initialized = false;

const defaultSections = ['A', 'B', 'C', 'D'];
const defaultSubjects = ['Math', 'History', 'English', 'Computer Science'];

const readCatalog = (key: string, fallback: string[]) => {
  try {
    const stored = localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) && parsed.every((value) => typeof value === 'string') && parsed.length > 0
      ? parsed.map((value: string) => value.trim()).filter(Boolean)
      : fallback;
  } catch {
    return fallback;
  }
};

const ensureInitialized = () => {
  if (initialized) return;

  sections.value = readCatalog('attendanceSections', defaultSections);
  subjects.value = readCatalog('attendanceSubjects', defaultSubjects);
  localStorage.setItem('attendanceSections', JSON.stringify(sections.value));
  localStorage.setItem('attendanceSubjects', JSON.stringify(subjects.value));
  initialized = true;
};

const addItem = (items: typeof sections, storageKey: string, value: string) => {
  const normalized = value.trim();
  if (!normalized || items.value.some((item) => item.toLowerCase() === normalized.toLowerCase())) return false;

  items.value.push(normalized);
  localStorage.setItem(storageKey, JSON.stringify(items.value));
  return true;
};

export const useClassCatalog = () => {
  ensureInitialized();

  return {
    sections: computed(() => sections.value),
    subjects: computed(() => subjects.value),
    addSection: (name: string) => addItem(sections, 'attendanceSections', name),
    addSubject: (name: string) => addItem(subjects, 'attendanceSubjects', name)
  };
};
