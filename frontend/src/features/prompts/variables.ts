import type { VariableSetting } from './types';

const VARIABLE_PATTERN = /\{\{\s*([^{}\s]+)\s*\}\}/g;

export function getVariableDefault(setting: VariableSetting | undefined): string {
  if (typeof setting === 'string') return setting;
  if (setting?.type === 'select') return setting.options[0] ?? '';
  return setting?.defaultValue ?? '';
}

export function applyVariables(content: string, settings: Record<string, VariableSetting>): string {
  return content.replace(VARIABLE_PATTERN, (match, name: string) => {
    return getVariableDefault(settings[name]) || match;
  });
}
