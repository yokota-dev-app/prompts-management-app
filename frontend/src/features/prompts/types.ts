export interface SelectVariableSetting {
  type: 'select';
  options: string[];
  defaultValue: string;
}

export type VariableSetting = string | SelectVariableSetting;

export interface Prompt {
  id: number;
  title: string;
  summary: string;
  content: string;
  author: string;
  updatedAt: string;
  variableSettings: Record<string, VariableSetting>;
}
