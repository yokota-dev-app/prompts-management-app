import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { deletePrompt } from '../api';

interface PromptActionsProps {
  promptId: number;
  title: string;
  content: string;
  size?: 'default' | 'large';
  onMenuOpenChange?: (open: boolean) => void;
  onCopyError?: (failed: boolean) => void;
  onDeleted?: () => void;
}

const iconButtonClasses = 'grid place-items-center rounded-lg border border-solid border-[#d5d0df] bg-white text-[#696572] [box-shadow:0_1px_2px_rgb(36_28_55/10%)] hover:border-[#b9afcd] hover:bg-[#faf9fc] hover:text-[#382569] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_svg]:stroke-2 cursor-pointer';
const menuItemClasses = 'rounded-md border-0 bg-transparent px-2.5 py-2 text-left text-[#45424d] text-sm [font-family:inherit] hover:bg-[#f5f3f8] focus-visible:bg-[#f5f3f8] focus-visible:[outline:none] cursor-pointer';
const dialogButtonClasses = 'h-10 min-w-22 rounded-lg border-0 text-sm cursor-pointer';

export default function PromptActions({ promptId, title, content, size = 'default', onMenuOpenChange, onCopyError, onDeleted }: PromptActionsProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const isLarge = size === 'large';

  const closeConfirm = () => {
    if (deleting) return;
    setConfirmOpen(false);
    setDeleteError('');
  };

  useEffect(() => {
    if (!confirmOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeConfirm();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deletePrompt(promptId);
      setConfirmOpen(false);
      onDeleted?.();
    } catch {
      setDeleteError('削除できませんでした。');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    onMenuOpenChange?.(menuOpen);
  }, [menuOpen, onMenuOpenChange]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopyError?.(false);
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      onCopyError?.(true);
      setCopied(false);
    }
  };

  const menuItems = [
    {
      label: '編集',
      onSelect: () => {
        setMenuOpen(false);
        navigate(`/mypage/prompts/${promptId}/edit`);
      },
      destructive: false,
    },
    {
      label: '削除',
      onSelect: () => {
        setMenuOpen(false);
        setConfirmOpen(true);
      },
      destructive: true,
    },
  ];

  return (
    <div className="flex flex-[0_0_auto] items-center gap-1" onClick={(event) => event.stopPropagation()}>
      <div className={`group relative ${isLarge ? 'h-10 w-10 flex-[0_0_2.5rem]' : 'h-8 w-8 flex-[0_0_2rem]'}`}>
        <button
          className={`${iconButtonClasses} ${isLarge ? 'h-10 w-10 [&_svg]:h-5 [&_svg]:w-5' : 'h-8 w-8 [&_svg]:h-4 [&_svg]:w-4'}`}
          type="button"
          onClick={copyPrompt}
          aria-label={`「${title}」のプロンプト内容をコピー`}
        >
          {copied ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m5 12 4 4L19 6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
            </svg>
          )}
        </button>
        {!copied && (
          <span className="pointer-events-none absolute right-full top-1/2 z-10 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-solid border-[#e9e7ed] bg-[#f3f1f8] px-2 py-1 text-xs font-bold text-[#85828c] opacity-0 transition-opacity group-hover:delay-1000 group-hover:opacity-100 group-focus-within:delay-1000 group-focus-within:opacity-100" role="tooltip">
            プロンプトをコピー
          </span>
        )}
        {copied && (
          <span className="absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#e8f7ed] px-2 py-1 text-xs font-bold text-[#1f9d5d]" role="status" aria-live="polite">
            コピーしました！
          </span>
        )}
      </div>
      <div className="relative" ref={menuRef}>
        <button
          className={`grid ${isLarge ? 'h-10 w-10 [&_svg]:h-6 [&_svg]:w-6' : 'h-8 w-8 [&_svg]:h-5 [&_svg]:w-5'} place-items-center rounded-lg border border-solid border-[#d5d0df] bg-white text-[#696572] [box-shadow:0_1px_2px_rgb(36_28_55/10%)] hover:border-[#b9afcd] hover:bg-[#faf9fc] hover:text-[#382569] aria-expanded:border-[#b9afcd] aria-expanded:bg-[#faf9fc] aria-expanded:text-[#382569] [&_svg]:fill-current cursor-pointer`}
          type="button"
          aria-label={`${title}のメニュー`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="5" cy="12" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-[3] grid w-24 rounded-lg border border-solid border-[#e9e7ed] bg-white p-1 [box-shadow:0_8px_22px_rgb(36_28_55/14%)]" role="menu" aria-label={`${title}の操作`}>
            {menuItems.map(({ label, onSelect, destructive }) => (
              <button
                key={label}
                className={`${menuItemClasses} ${destructive ? 'text-[#c33b36] hover:bg-[#fff1f0] focus-visible:bg-[#fff1f0]' : ''}`}
                type="button"
                role="menuitem"
                onClick={onSelect}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      {confirmOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] grid place-items-center bg-[rgb(36_28_55/45%)]" onClick={closeConfirm}>
            <div
              className="w-[90vw] max-w-sm cursor-default rounded-xl bg-white p-6 text-[#28252f] [box-shadow:0_16px_40px_rgb(36_28_55/25%)]"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-dialog-title"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="m-0 text-lg font-bold leading-relaxed" id="delete-dialog-title">プロンプトを削除してよろしいですか？</p>
              {deleteError && <p className="m-0 mt-2 text-[#b42318] text-sm font-normal" role="alert">{deleteError}</p>}
              <div className="mt-5 flex justify-end gap-2.5">
                <button type="button" className={`${dialogButtonClasses} bg-[#ececf0] text-[#45424d]`} autoFocus onClick={closeConfirm}>
                  キャンセル
                </button>
                <button type="button" className={`${dialogButtonClasses} bg-[#c33b36] text-white disabled:cursor-not-allowed disabled:opacity-60`} disabled={deleting} onClick={confirmDelete}>
                  OK
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
