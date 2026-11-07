import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getMyPrompts } from '../../features/prompts/api';
import PromptCard from '../../features/prompts/components/PromptCard';
import type { Prompt } from '../../features/prompts/types';

export default function MyPage() {
  const searchQuery = useOutletContext<string>();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getMyPrompts()
      .then((items) => {
        if (active) setPrompts(items);
      })
      .catch(() => {
        if (active) setError('プロンプトを読み込めませんでした。時間をおいて再度お試しください。');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredPrompts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return prompts;

    return prompts.filter((prompt) =>
      `${prompt.title} ${prompt.summary} ${prompt.content}`.toLocaleLowerCase().includes(query),
    );
  }, [prompts, searchQuery]);

  return (
    <section className="text-[#28252f]" aria-labelledby="mypage-title">
      <div className="mb-7 flex items-stretch justify-between gap-4 sm:items-start [&_h1]:m-0 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-[#28252f]">
        <div>
          <p className="mb-2 mt-0 text-xs font-bold tracking-widest text-[#7d6aab]">YOUR WORKSPACE</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 id="mypage-title">マイプロンプト</h1>
            {!loading && !error && (
              <span className="whitespace-nowrap rounded-full border border-solid border-[#e9e6ef] bg-white px-3 py-2 text-sm text-[#66616f]">
                {filteredPrompts.length} 件
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-[0_0_auto] items-start">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-solid border-[#34265b] bg-[#34265b] px-3 text-sm font-bold text-white transition-all duration-150 ease-in hover:-translate-y-0.5 hover:bg-[#463675] [&>span]:text-lg [&>span]:leading-none md:px-4"
            to="/mypage/create"
            aria-label="プロンプト作成"
          >
            <span aria-hidden="true">＋</span>
            <span className="hidden md:inline">プロンプト作成</span>
          </Link>
        </div>
      </div>

      {loading && (
        <p className="px-5 py-9 text-center text-sm text-[#77747e]" role="status">
          プロンプトを読み込み中...
        </p>
      )}
      {error && (
        <p className="px-5 py-9 text-center text-sm text-[#b42318]" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && filteredPrompts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onDeleted={(id) => setPrompts((items) => items.filter((item) => item.id !== id))}
            />
          ))}
        </div>
      )}
      {!loading && !error && filteredPrompts.length === 0 && (
        <div className="grid min-h-64 content-center justify-items-center rounded-xl border border-dashed border-[#dedbe4] bg-[rgb(255_255_255/65%)] p-8 text-center [&>span]:grid [&>span]:h-12 [&>span]:w-12 [&>span]:place-items-center [&>span]:rounded-full [&>span]:bg-[#f0edf5] [&>span]:text-3xl [&>span]:text-[#6d5a91] [&_h2]:mb-1.5 [&_h2]:mt-4 [&_h2]:mx-0 [&_h2]:text-base [&_h2]:text-[#3a3741] [&_p]:m-0 [&_p]:text-xs [&_p]:text-[#85828c]">
          <span aria-hidden="true">⌕</span>
          <h2>{prompts.length === 0 ? 'プロンプトはまだありません' : '該当するプロンプトがありません'}</h2>
          <p>
            {prompts.length === 0
              ? 'プロンプトを作成すると、ここに表示されます。'
              : '別のキーワードで検索してみてください。'}
          </p>
        </div>
      )}
    </section>
  );
}
