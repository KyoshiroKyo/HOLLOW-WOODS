const env = (import.meta as ImportMeta & {
  env?: { DEV?: boolean; VITE_HOLLOW_WOODS_QA?: string };
}).env;

export const QA_BUILD = env?.DEV === true || env?.VITE_HOLLOW_WOODS_QA === '1';
export const QA_SAVE_KEY = 'hollow_woods_qa_v1_savegame';
export const QA_SETTINGS_KEY = 'hollow_woods_qa_settings';
export const GRAPHICS_QUALITY_KEY = QA_BUILD ? 'hw_qa_graphics_quality' : 'hw_graphics_quality';
