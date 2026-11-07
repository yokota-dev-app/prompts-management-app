import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getPrompt } from '../../features/prompts/api';
import type { PromptDetail } from '../../features/prompts/api';
import PromptActions from '../../features/prompts/components/PromptActions';
import { getVariableDefault } from '../../features/prompts/variables';

const VARIABLE_SPLIT_PATTERN = /\{\{\s*([^{}\s]+)\s*\}\}/;
const detailSectionClasses = 'mx-auto grid w-full min-w-0 max-w-7xl gap-3 text-[#28252f] [&_h1]:m-0 [&_h1]:text-3xl [&_h2]:mt-2 [&_h2]:mb-0 [&_h2]:text-[#45424d] [&_h2]:text-base';
const variableInputClasses = 'h-10 rounded-lg border border-solid border-[#b9b4c7] bg-white px-3 py-0 text-[#28252f] [font-family:inherit] text-base [box-shadow:0_1px_2px_rgb(36_28_55/8%)] focus:border-[#5b46a0] focus:[box-shadow:0_0_0_3px_rgb(91_70_160/18%)] focus:[outline:none]';

function extractVariables(content: string): string[] {
  return [...new Set(content.split(VARIABLE_SPLIT_PATTERN).filter((_, index) => index % 2 === 1))];
}

export default function PromptDetailPage() {
  const { id = '' } = useParams();
  return <PromptDetail key={id} id={id} />;
}

function PromptDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const [showRaw, setShowRaw] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getPrompt(id)
      .then((item) => {
        if (active) setPrompt(item);
      })
      .catch(() => {
        if (active) setError('プロンプトを読み込めませんでした。');
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <section className={detailSectionClasses}>
        <p className="m-0 text-[#b42318] text-base" role="alert">{error}</p>
        <Link className="text-[#493b68] text-sm no-underline" to="/mypage">マイプロンプトに戻る</Link>
      </section>
    );
  }

  if (!prompt || String(prompt.id) !== id) return <p role="status">読み込み中...</p>;

  const variableNames = extractVariables(prompt.content);
  const valueOf = (name: string) => inputs[name] ?? getVariableDefault(prompt.variableSettings[name]);
  const parts = prompt.content.split(VARIABLE_SPLIT_PATTERN);
  const appliedContent = parts
    .map((part, index) => (index % 2 === 1 ? valueOf(part) || `{{${part}}}` : part))
    .join('');

  return (
    <section className={detailSectionClasses}>
      <Link className="text-[#493b68] text-sm no-underline" to="/mypage">← マイプロンプトに戻る</Link>
      <div className="flex min-w-0 items-center justify-between gap-3">
        <h1 className="min-w-0 [overflow-wrap:anywhere]">{prompt.title}</h1>
        <PromptActions
          promptId={prompt.id}
          title={prompt.title}
          content={showRaw ? prompt.content : appliedContent}
          onCopyError={setCopyFailed}
          onDeleted={() => navigate('/mypage')}
        />
      </div>
      {copyFailed && <p className="m-0 text-[#b42318] text-base" role="alert">コピーできませんでした。</p>}
      <p className="m-0 text-[#85828c] text-sm">
        {prompt.isPublic ? '公開' : '非公開'} ・ {prompt.author} ・ 更新日 {prompt.updatedAt}
      </p>
      {prompt.summary && <p className="m-0 text-base leading-relaxed [overflow-wrap:anywhere]">{prompt.summary}</p>}

      <div className="flex min-w-0 items-center justify-between gap-3">
        <h2>{showRaw ? 'プロンプト原文' : 'プロンプト内容（変数適用後）'}</h2>
        <button
          type="button"
          className="h-8 rounded-lg border border-solid border-[#b9b4c7] bg-white px-3 py-0 text-[#493b68] text-sm [font-family:inherit] cursor-pointer aria-pressed:bg-[#292633] aria-pressed:text-white"
          aria-pressed={showRaw}
          onClick={() => setShowRaw((value) => !value)}
        >
          原文表示 {showRaw ? 'ON' : 'OFF'}
        </button>
      </div>
      <pre className="m-0 whitespace-pre-wrap rounded-lg border border-solid border-[#b9b4c7] bg-[#f3f1f8] p-4 text-[#28252f] [font-family:inherit] text-base leading-loose [overflow-wrap:anywhere]">
        {showRaw
          ? prompt.content
          : parts.map((part, index) =>
              index % 2 === 1 ? (
                <strong key={index} className="relative cursor-default text-[#5b46a0] font-bold hover:after:absolute hover:after:bottom-full hover:after:mb-1 hover:after:left-0 hover:after:z-[1] hover:after:whitespace-nowrap hover:after:rounded-md hover:after:bg-[#292633] hover:after:px-2 hover:after:py-1 hover:after:text-sm hover:after:font-normal hover:after:leading-snug hover:after:text-white hover:after:content-[attr(data-name)] hover:after:pointer-events-none" data-name={part}>
                  {valueOf(part) || `{{${part}}}`}
                </strong>
              ) : (
                part
              ),
            )}
      </pre>

      <h2>変数設定</h2>
      {variableNames.length === 0 ? (
        <p className="m-0 text-[#85828c] text-sm">このプロンプトに変数はありません。</p>
      ) : (
        <div className="grid gap-2.5">
          {variableNames.map((name) => {
            const setting = prompt.variableSettings[name];
            if (typeof setting === 'object' && setting?.type === 'select') {
              return (
                <label key={name} className="grid grid-cols-1 items-center gap-3 md:grid-cols-[10rem_minmax(0,1fr)] [&_code]:text-[#493b68] [&_code]:text-base">
                  <code>{name}</code>
                  <select
                    className={variableInputClasses}
                    value={valueOf(name)}
                    onChange={(event) => setInputs((current) => ({ ...current, [name]: event.target.value }))}
                  >
                    <option value="">選択してください</option>
                    {setting.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              );
            }

            return (
              <label key={name} className="grid grid-cols-1 items-center gap-3 md:grid-cols-[10rem_minmax(0,1fr)] [&_code]:text-[#493b68] [&_code]:text-base">
                <code>{name}</code>
                <input
                  className={variableInputClasses}
                  value={valueOf(name)}
                  onChange={(event) => setInputs((current) => ({ ...current, [name]: event.target.value }))}
                  placeholder="値を入力"
                />
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
