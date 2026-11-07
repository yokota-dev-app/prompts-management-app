import { apiClient } from '../../shared/api/client';
import type { Prompt, VariableSetting } from './types';

interface PromptResponse {
  id: number;
  title: string;
  description: string | null;
  content: string;
  author: string;
  updated_at: string;
  variable_settings: Record<string, VariableSetting> | null;
}

function formatDate(value: string): string {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}/${month}/${day}`;
}

export interface PromptDetail extends Prompt {
  isPublic: boolean;
}

export async function getPrompt(id: string): Promise<PromptDetail> {
  const { data } = await apiClient.get<PromptResponse & { is_public: boolean }>(
    `/prompts/${id}`,
  );
  return {
    id: data.id,
    title: data.title,
    summary: data.description ?? '',
    content: data.content,
    author: data.author,
    updatedAt: formatDate(data.updated_at),
    isPublic: data.is_public,
    variableSettings: data.variable_settings ?? {},
  };
}

export async function getMyPrompts(): Promise<Prompt[]> {
  const response = await apiClient.get<PromptResponse[]>('/prompts');
  return response.data.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.description ?? '',
    content: item.content,
    author: item.author,
    updatedAt: formatDate(item.updated_at),
    variableSettings: item.variable_settings ?? {},
  }));
}

export interface CreatePromptInput {
  title: string;
  description: string;
  content: string;
  isPublic: boolean;
  variableSettings: Record<string, VariableSetting>;
}

function toRequestBody(input: CreatePromptInput) {
  return {
    prompt: {
      title: input.title,
      description: input.description,
      content: input.content,
      is_public: input.isPublic,
      variable_settings: input.variableSettings,
    },
  };
}

export async function createPrompt(input: CreatePromptInput): Promise<{ id: number }> {
  const response = await apiClient.post('/prompts', toRequestBody(input));
  return response.data;
}

export async function updatePrompt(id: string, input: CreatePromptInput): Promise<{ id: number }> {
  const response = await apiClient.patch(`/prompts/${id}`, toRequestBody(input));
  return response.data;
}

export async function deletePrompt(id: number): Promise<void> {
  await apiClient.delete(`/prompts/${id}`);
}
