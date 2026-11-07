import { useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import type { CreatePromptInput } from '../../features/prompts/api';
import type { SelectVariableSetting, VariableSetting } from '../../features/prompts/types';
import { getVariableDefault } from '../../features/prompts/variables';

interface PromptFormProps {
  heading: string;
  submitLabel: string;
  submittingLabel: string;
  errorFallback: string;
  initial?: CreatePromptInput;
  onSubmit: (input: CreatePromptInput) => Promise<void>;
  onCancel: () => void;
}

const VARIABLE_PATTERN = /\{\{\s*([^{}\s]+)\s*\}\}/g;
const fieldClasses = 'grid gap-1.5 text-[#45424d] text-sm font-bold [&_input]:h-10 [&_input]:rounded-lg [&_input]:border [&_input]:border-solid [&_input]:border-[#b9b4c7] [&_input]:bg-white [&_input]:px-3 [&_input]:py-0 [&_input]:text-[#28252f] [&_input]:text-sm [&_input]:font-normal [&_input]:[box-shadow:0_1px_2px_rgb(36_28_55/8%)] [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-solid [&_textarea]:border-[#b9b4c7] [&_textarea]:bg-white [&_textarea]:text-[#28252f] [&_textarea]:[box-shadow:0_1px_2px_rgb(36_28_55/8%)] [&_textarea]:[font-family:inherit] [&_textarea]:text-sm [&_textarea]:font-normal [&_textarea]:leading-relaxed [&_select]:h-10 [&_select]:rounded-lg [&_select]:border [&_select]:border-solid [&_select]:border-[#b9b4c7] [&_select]:bg-white [&_select]:px-3 [&_select]:py-0 [&_select]:text-[#28252f] [&_select]:[box-shadow:0_1px_2px_rgb(36_28_55/8%)] [&_select]:[font-family:inherit] [&_select]:text-sm [&_select]:font-normal [&_input:focus]:border-[#5b46a0] [&_input:focus]:[box-shadow:0_0_0_3px_rgb(91_70_160/18%)] [&_input:focus]:[outline:none] [&_textarea:focus]:border-[#5b46a0] [&_textarea:focus]:[box-shadow:0_0_0_3px_rgb(91_70_160/18%)] [&_textarea:focus]:[outline:none] [&_select:focus]:border-[#5b46a0] [&_select:focus]:[box-shadow:0_0_0_3px_rgb(91_70_160/18%)] [&_select:focus]:[outline:none]';
const variableFieldClasses = 'grid gap-1 [&_code]:text-[#493b68] [&_code]:text-sm [&_input]:h-9 [&_input]:rounded-md [&_input]:border [&_input]:border-solid [&_input]:border-[#b9b4c7] [&_input]:bg-white [&_input]:px-2.5 [&_input]:py-0 [&_input]:text-sm [&_input]:font-normal [&_input:focus]:border-[#5b46a0] [&_input:focus]:[box-shadow:0_0_0_3px_rgb(91_70_160/18%)] [&_input:focus]:[outline:none] [&_textarea]:min-h-20 [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-solid [&_textarea]:border-[#b9b4c7] [&_textarea]:bg-white [&_textarea]:p-2.5 [&_textarea]:text-sm [&_textarea]:font-normal [&_textarea:focus]:border-[#5b46a0] [&_textarea:focus]:[box-shadow:0_0_0_3px_rgb(91_70_160/18%)] [&_textarea:focus]:[outline:none] [&_select]:h-9 [&_select]:rounded-md [&_select]:border [&_select]:border-solid [&_select]:border-[#b9b4c7] [&_select]:bg-white [&_select]:px-2.5 [&_select]:py-0 [&_select]:text-sm [&_select]:font-normal [&_select:focus]:border-[#5b46a0] [&_select:focus]:[box-shadow:0_0_0_3px_rgb(91_70_160/18%)] [&_select:focus]:[outline:none]';
function RequiredBadge() {
  return (
    <span className="ml-2 rounded-sm bg-[#fdecea] px-1.5 py-0.5 align-middle text-xs font-bold text-[#b42318]">
      必須
    </span>
  );
}

const actionButtonClasses = 'h-10 min-w-24 rounded-lg border-0 text-sm cursor-pointer';

function extractVariables(content: string): string[] {
  return [...new Set([...content.matchAll(VARIABLE_PATTERN)].map((match) => match[1]))];
}

function renderPreview(content: string, values: Record<string, string>): string {
  return content.replace(VARIABLE_PATTERN, (placeholder, name: string) => {
    const value = values[name];
    return value ? value : placeholder;
  });
}

function isSelectSetting(setting: VariableSetting | undefined): setting is SelectVariableSetting {
  return typeof setting === 'object' && setting !== null && setting.type === 'select';
}

function normalizeOptions(value: string): string[] {
  return [...new Set(value.split('\n').map((option) => option.trim()).filter(Boolean))];
}

export default function PromptForm({
  heading,
  submitLabel,
  submittingLabel,
  errorFallback,
  initial,
  onSubmit,
  onCancel,
}: PromptFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [variableSettings, setVariableSettings] = useState<Record<string, VariableSetting>>(
    initial?.variableSettings ?? {},
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const variables = useMemo(() => extractVariables(content), [content]);
  const previewValues = useMemo(
    () => Object.fromEntries(
      Object.entries(variableSettings).map(([name, setting]) => [name, getVariableDefault(setting)]),
    ),
    [variableSettings],
  );
  const preview = useMemo(() => renderPreview(content, previewValues), [content, previewValues]);

  const handleSubmit = async () => {
    const validationErrors: string[] = [];
    if (!title.trim()) validationErrors.push('タイトルを入力してください。');
    if (!content.trim()) validationErrors.push('プロンプト内容を入力してください。');
    for (const name of variables) {
      const setting = variableSettings[name];
      if (isSelectSetting(setting)) {
        const options = normalizeOptions(setting.options.join('\n'));
        if (options.length === 0) validationErrors.push(`「${name}」の候補を1つ以上入力してください。`);
      }
    }
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submittedVariableSettings = Object.fromEntries(
      variables.map((name) => {
        const setting = variableSettings[name] ?? '';
        return [
          name,
          isSelectSetting(setting)
            ? {
                ...setting,
                options: normalizeOptions(setting.options.join('\n')),
                defaultValue: normalizeOptions(setting.options.join('\n'))[0] ?? '',
              }
            : setting,
        ];
      }),
    );

    setSubmitting(true);
    setErrors([]);
    try {
      await onSubmit({
        title: title.trim(),
        description,
        content,
        isPublic,
        variableSettings: submittedVariableSettings,
      });
    } catch (error) {
      const apiErrors = isAxiosError<{ errors?: string[] }>(error) ? error.response?.data?.errors : undefined;
      setErrors(apiErrors?.length ? apiErrors : [errorFallback]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mx-auto grid w-full max-w-7xl gap-4" onSubmit={(event) => event.preventDefault()}>
      <h1 className="m-0 text-[#28252f] text-3xl">{heading}</h1>
      {errors.length > 0 && (
        <ul className="m-0 rounded-lg border border-solid border-[#f3c7c2] bg-[#fff3f1] py-2.5 pr-3.5 pl-8 text-[#b42318] text-sm" role="alert">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <label className={fieldClasses}>
        <span>
          タイトル
          <RequiredBadge />
        </span>
        <input aria-required="true" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} />
      </label>

      <label className={fieldClasses}>
        <span>説明</span>
        <textarea
          className="min-h-10 resize-y px-3 py-3 leading-relaxed"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 md:relative md:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="grid content-start gap-4">
          <label className={fieldClasses}>
            <span>
              プロンプト内容
              <RequiredBadge />
            </span>
            <textarea
              aria-required="true"
              className="min-h-64 resize-y p-3 leading-relaxed"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="変数は {{変数名}} の形式で記述できます"
            />
          </label>
          <div className={fieldClasses}>
            <span>プレビュー</span>
            <div className="min-h-30 whitespace-pre-wrap rounded-lg border border-solid border-[#b9b4c7] bg-[#f3f1f8] p-3 text-[#28252f] text-sm font-normal leading-relaxed [box-shadow:0_1px_2px_rgb(36_28_55/8%)] [font-family:inherit] [overflow-wrap:anywhere]" aria-live="polite">{preview}</div>
          </div>
        </div>

        <aside className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-1.5 text-[#45424d] text-sm font-bold md:absolute md:inset-y-0 md:right-0 md:w-60">
          <span>変数</span>
          <div className="grid min-h-0 content-start gap-3 overflow-y-auto rounded-lg border border-solid border-[#b9b4c7] bg-[#f3f1f8] p-3 text-[#28252f] [box-shadow:0_1px_2px_rgb(36_28_55/8%)] [font-family:inherit] text-base font-normal">
            {variables.length === 0 ? (
              <p className="m-0 text-[#a09da6] text-sm leading-relaxed">{'{{変数名}}'} を入力すると、ここに表示されます。</p>
            ) : (
              variables.map((name) => (
                <div key={name} className={variableFieldClasses}>
                  <code>{name}</code>
                  <select
                    aria-label={`${name}の入力形式`}
                    value={isSelectSetting(variableSettings[name]) ? 'select' : 'text'}
                    onChange={(event) => {
                      const current = variableSettings[name] ?? '';
                      if (event.target.value === 'select') {
                        const defaultValue = getVariableDefault(current);
                        setVariableSettings((settings) => ({
                          ...settings,
                          [name]: {
                            type: 'select',
                            options: defaultValue ? [defaultValue] : [],
                            defaultValue,
                          },
                        }));
                      } else {
                        setVariableSettings((settings) => ({
                          ...settings,
                          [name]: getVariableDefault(current),
                        }));
                      }
                    }}
                  >
                    <option value="text">自由入力</option>
                    <option value="select">プルダウン</option>
                  </select>
                  {isSelectSetting(variableSettings[name]) ? (
                    <>
                      <textarea
                        aria-label={`${name}の候補`}
                        value={variableSettings[name].options.join('\n')}
                        onChange={(event) => {
                          const current = variableSettings[name];
                          if (isSelectSetting(current)) {
                            const options = normalizeOptions(event.target.value);
                            setVariableSettings((settings) => ({
                              ...settings,
                              [name]: {
                                ...current,
                                options: event.target.value.split('\n'),
                                defaultValue: options[0] ?? '',
                              },
                            }));
                          }
                        }}
                        placeholder={'候補を1行に1つずつ入力\n例: 丁寧\nカジュアル'}
                      />
                    </>
                  ) : (
                    <input
                      value={typeof variableSettings[name] === 'string' ? variableSettings[name] : ''}
                      onChange={(event) =>
                        setVariableSettings((current) => ({ ...current, [name]: event.target.value }))
                      }
                      placeholder="初期値"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 [&_select]:min-w-36">
        <label className={fieldClasses}>
          <span>公開設定</span>
          <select
            value={isPublic ? 'public' : 'private'}
            onChange={(event) => setIsPublic(event.target.value === 'public')}
          >
            <option value="private">非公開</option>
            <option value="public">公開</option>
          </select>
        </label>
        <div className="flex gap-3">
          <button type="button" className={`${actionButtonClasses} bg-[#ececf0] text-[#45424d]`} onClick={onCancel}>
            キャンセル
          </button>
          <button type="button" className={`${actionButtonClasses} bg-[#292633] text-white enabled:hover:bg-[#3a3547] disabled:cursor-not-allowed disabled:opacity-60`} onClick={handleSubmit} disabled={submitting}>
            {submitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
