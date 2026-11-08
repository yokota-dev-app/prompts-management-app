import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';

const HEADER =
  'sticky top-0 z-20 flex h-auto min-h-18 flex-wrap items-center justify-between gap-4 border-b border-[#f0eff5] bg-[rgb(255_255_255/0.94)] px-5 py-3.5 shadow-[0_3px_8px_rgb(36_28_55/8%)] backdrop-blur-md md:flex-nowrap md:gap-4 md:px-8 md:py-0 lg:h-22 lg:gap-7 lg:px-20';
const BRAND =
  'inline-flex items-center gap-2.5 whitespace-nowrap text-lg font-extrabold tracking-tight md:text-3xl';
const BRAND_MARK =
  'inline-flex h-8 w-8 md:h-9 md:w-9';
const ACTIONS = 'ml-auto flex items-center gap-2 md:gap-2.5';
const BUTTON =
  'inline-flex min-h-10 items-center justify-center gap-3 whitespace-nowrap rounded-lg border border-solid px-3 text-xs font-bold transition duration-200 hover:-translate-y-px md:min-h-12 md:px-5 md:text-sm';
const BUTTON_QUIET =
  `${BUTTON} hidden border-[#c9c5d6] bg-white text-[#4c4a5b] shadow-[0_1px_3px_rgb(36_28_55/10%)] hover:border-[#a9a3be] hover:bg-[#f8f7fc] sm:inline-flex`;
const BUTTON_DARK =
  `${BUTTON} border-transparent bg-[#292633] text-white hover:bg-[#3a3547]`;

export default function Header() {
  const [logoutError, setLogoutError] = useState('');
  const { user, isLoggedIn, loading, logoutUser } = useAuth();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await logoutUser();
    } catch {
      setLogoutError('ログアウトに失敗しました。時間をおいて再度お試しください。');
    }
  };

  return (
    <>
      <header className={HEADER}>
        <Link className={BRAND} to="/" aria-label="Prompts ホーム">
          <span className={BRAND_MARK} aria-hidden="true">
            <img className="h-full w-full" src="/favicon.svg" alt="" />
          </span>
          <span>Prompts</span>
        </Link>

        <nav className={ACTIONS} aria-label="メインメニュー">
          {pathname === '/' && (
            <Link
              className="mr-3 whitespace-nowrap text-sm font-bold text-[#5e5a70] transition-colors hover:text-(--top-purple) sm:mr-5"
              to="/#how-to-use"
              onClick={() => {
                document.getElementById('how-to-use')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              使い方
            </Link>
          )}
          {!loading && (isLoggedIn ? (
            <>
              <span className="whitespace-nowrap text-sm font-bold text-[#4c4a5b]">{user?.name} さん</span>
              <button className={BUTTON_DARK} type="button" onClick={handleLogout}>
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link className={BUTTON_QUIET} to="/signup">新規登録</Link>
              <Link className={BUTTON_DARK} to="/login">ログイン</Link>
            </>
          ))}
        </nav>
      </header>
      {logoutError && <p className="m-0 bg-[#fff5f4] px-5 py-2 text-center text-sm text-[#b42318]" role="alert">{logoutError}</p>}
    </>
  );
}
