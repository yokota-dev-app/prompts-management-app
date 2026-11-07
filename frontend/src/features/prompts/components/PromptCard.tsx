import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Prompt } from '../types';
import { applyVariables } from '../variables';
import PromptActions from './PromptActions';

interface PromptCardProps {
  prompt: Prompt;
  onDeleted?: (id: number) => void;
}

export default function PromptCard({ prompt, onDeleted }: PromptCardProps) {
  const [copyError, setCopyError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const appliedContent = applyVariables(prompt.content, prompt.variableSettings);
  const detailPath = `/mypage/prompts/${prompt.id}`;

  return (
    <article
      className={`relative flex min-w-0 flex-col rounded-xl border border-solid border-[#ecebf0] bg-white p-5 [box-shadow:0_3px_12px_rgb(36_28_55/3%)] [transition:box-shadow_160ms_ease,transform_160ms_ease] hover:-translate-y-0.5 hover:[box-shadow:0_9px_24px_rgb(36_28_55/8%)] ${menuOpen ? 'z-[2]' : ''} cursor-pointer`}
      tabIndex={0}
      aria-label={`「${prompt.title}」の詳細を開く`}
      onClick={() => navigate(detailPath)}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && event.key === 'Enter') navigate(detailPath);
      }}
    >
      <div className="flex items-start justify-between gap-3 [&_h2]:m-0 [&_h2]:overflow-hidden [&_h2]:text-[#26232d] [&_h2]:text-lg [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-ellipsis [&_h2]:[display:-webkit-box] [&_h2]:[-webkit-box-orient:vertical] [&_h2]:[-webkit-line-clamp:2] [&_h2]:[line-clamp:2]">
        <div className="group relative min-w-0">
          <h2>{prompt.title}</h2>
          {prompt.summary && (
            <p
              className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden w-64 max-w-[80vw] rounded-lg bg-[#292633] px-3 py-2 text-sm leading-relaxed text-white [box-shadow:0_6px_18px_rgb(36_28_55/20%)] group-hover:block"
              role="tooltip"
            >
              {prompt.summary}
            </p>
          )}
        </div>
        <PromptActions
          promptId={prompt.id}
          title={prompt.title}
          content={appliedContent}
          onMenuOpenChange={setMenuOpen}
          onCopyError={setCopyError}
          onDeleted={() => onDeleted?.(prompt.id)}
        />
      </div>
      <div className="mb-2 mt-4 flex items-baseline justify-between gap-2 [&_h3]:m-0 [&_h3]:text-[#45424d] [&_h3]:text-sm [&_h3]:font-bold [&_span]:text-[#a09da6] [&_span]:text-sm">
        <h3>プロンプト内容</h3>
        <span>{prompt.content.length} 文字</span>
      </div>
      <div className="min-h-32 cursor-auto rounded-lg border border-solid border-[#f0eef3] bg-[#faf9fc] p-3" onClick={(event) => event.stopPropagation()}>
        <pre className="m-0 [display:-webkit-box] overflow-hidden text-ellipsis whitespace-pre-wrap text-[#65616c] [font-family:inherit] text-base leading-relaxed [overflow-wrap:anywhere] [-webkit-box-orient:vertical] [-webkit-line-clamp:5] [line-clamp:5]">{appliedContent}</pre>
      </div>
      {copyError && <p className="mt-2 text-[#b42318] text-sm" role="alert">コピーできませんでした。</p>}
      <footer className="mt-auto flex justify-between gap-2 pt-4 text-[#87848e] text-sm">
        <span>{prompt.author}</span>
        <time dateTime={prompt.updatedAt.replaceAll('/', '-')}>更新日 {prompt.updatedAt}</time>
      </footer>
    </article>
  );
}
