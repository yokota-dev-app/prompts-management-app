import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';

const HEADER =
  'flex h-auto min-h-18 flex-wrap items-center justify-between gap-4 border-b border-[#f0eff5] bg-[rgb(255_255_255/0.94)] px-5 py-3.5 md:flex-nowrap md:gap-4 md:px-8 md:py-0 lg:h-22 lg:gap-7 lg:px-20';
const BRAND =
  'inline-flex items-center gap-2.5 whitespace-nowrap text-lg font-extrabold tracking-tight md:text-3xl';
const BRAND_MARK =
  'inline-flex h-8 w-8 md:h-9 md:w-9';
const ACTIONS = 'ml-auto flex items-center gap-2 md:gap-2.5';
const BUTTON =
  'inline-flex min-h-10 items-center justify-center gap-3 whitespace-nowrap rounded-lg border border-solid px-3 text-xs font-bold transition duration-200 hover:-translate-y-px md:min-h-12 md:px-5 md:text-sm';
const BUTTON_QUIET =
  `${BUTTON} hidden border-[#e8e6ef] bg-white text-[#4c4a5b] hover:bg-[#f8f7fc] sm:inline-flex`;
const BUTTON_DARK =
  `${BUTTON} border-transparent bg-[#292633] text-white hover:bg-[#3a3547]`;

export default function Header() {
    const [logoutError, setLogoutError] = useState('');
  const { user, isLoggedIn, loading, logoutUser } = useAuth();

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
            <svg className="h-full w-full" viewBox="0 0 40 40" role="img">
              <rect className="fill-(--top-purple)" x="3" y="3" width="34" height="34" rx="11" />
              <path className="fill-none stroke-white stroke-2 stroke-linecap-round" d="M13 13h14M13 20h14M13 27h8" />
            </svg>
          </span>
          <span>Prompts</span>
        </Link>

        <nav className={ACTIONS} aria-label="アカウントメニュー">
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
