import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import Footer from '../shared/components/Footer';

const navigationItems = [
  { to: '/mypage', label: 'マイプロンプト', icon: '▤', end: true },
  { to: '/mypage/settings', label: '設定', icon: '⚙', end: false },
];

const quickLinks = [
  { href: 'https://chatgpt.com/', label: 'ChatGPT', icon: '◉' },
  { href: 'https://gemini.google.com/', label: 'Gemini', icon: '✦' },
  { href: 'https://claude.ai/', label: 'Claude', icon: '✳' },
];

const navLinkBase =
  'flex min-h-11 items-center justify-center rounded-lg p-0 text-xl hover:text-[#302058] sm:gap-3 md:justify-start md:px-3 md:text-sm md:[&>span:first-child]:text-lg md:[&>span:last-child]:inline';
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `${navLinkBase} [&>span:last-child]:hidden ${isActive ? 'bg-[#f0eef5] text-[#34265b] font-bold' : 'text-[#55535d]'}`;
const quickLink =
  '[&_a]:flex [&_a]:items-center [&_a]:gap-2 [&_a]:p-2.5 [&_a]:text-[#4c4a52] [&_a]:text-base [&_a:hover]:text-[#302058] [&_a_span:nth-child(2)]:flex-1';
const logoutButton =
  'flex-[0_0_auto] min-h-10 whitespace-nowrap rounded-lg border border-solid border-transparent bg-[#292633] px-3 py-0 text-xs font-bold text-white cursor-pointer hover:bg-[#3a3547] sm:min-h-12 sm:px-5 sm:text-sm';

export default function DashboardLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const { user, isLoggedIn, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await logoutUser();
      navigate('/', { replace: true });
    } catch {
      setLogoutError('ログアウトに失敗しました。時間をおいて再度お試しください。');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f8fa] font-sans text-[#242328]">
      <aside className="sticky top-0 flex h-screen basis-14 flex-col self-start overflow-y-auto border-r border-r-[#e9e8ec] bg-white px-1 py-4 sm:basis-16 sm:px-2 md:basis-60 md:items-stretch md:px-4 md:pb-5 md:pt-7">
        <Link
          className="mb-6 ml-0 flex items-center justify-center gap-3 whitespace-nowrap font-sans text-xl font-extrabold tracking-tight text-[#20212a] sm:mb-8 md:ml-1 md:justify-start md:text-2xl md:[&>span:last-child]:inline"
          to="/"
          aria-label="Prompts ホーム"
        >
          <span
            className="inline-flex h-9 w-9 shrink-0 [&_svg]:h-full [&_svg]:w-full [&_rect]:[fill:#6854d9] [&_path]:[fill:none] [&_path]:[stroke:white] [&_path]:[stroke-width:2.4] [&_path]:[stroke-linecap:round]"
            aria-hidden="true"
          >
            <svg viewBox="0 0 40 40">
              <rect x="3" y="3" width="34" height="34" rx="11" />
              <path d="M13 13h14M13 20h14M13 27h8" />
            </svg>
          </span>
          <span className="hidden">Prompts</span>
        </Link>

        <nav className="mt-4 grid w-full gap-1.5 md:mt-6" aria-label="メインメニュー">
          {navigationItems.map(({ to, label, icon, end }) => (
            <NavLink key={to} className={navLinkClass} end={end} to={to}>
              {icon} <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mx-0 mb-4 mt-5 h-px bg-[#e9e8ec] md:mb-5 md:mt-6" />
        <section
          className={`${quickLink} hidden md:block [&_h2]:mb-2.5 [&_h2]:ml-2.5 [&_h2]:mt-0 [&_h2]:text-base [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-widest [&_h2]:text-[#85838c]`}
          aria-labelledby="quick-links-heading"
        >
          <h2 id="quick-links-heading">クイックリンク</h2>
          {quickLinks.map(({ href, label, icon }) => (
            <a key={href} href={href} target="_blank" rel="noreferrer">
              {icon} <span>{label}</span><span aria-hidden="true">↗</span>
            </a>
          ))}
        </section>

        <div className="mt-auto flex items-center gap-2.5 border-t border-t-[#e9e8ec] px-0 pt-3.5 md:px-1">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eee9f8] text-sm font-bold text-[#39266a]"
            aria-hidden="true"
          >
            {user?.name?.slice(0, 1) ?? 'G'}
          </span>
          <span className="hidden overflow-hidden text-sm text-ellipsis whitespace-nowrap text-[#514f58] md:inline">
            {user?.name ?? 'ゲストユーザー'}
          </span>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[1] flex min-h-16 items-center justify-between gap-2.5 border-b border-b-[#f0eff5] bg-[rgb(255_255_255/94%)] px-4 py-3.5 backdrop-blur-md [border-bottom-style:solid] sm:gap-4 md:min-h-20 md:gap-6 md:px-8 md:py-4 lg:px-14">
          <form
            className="flex h-11 w-full max-w-xl items-center gap-1.5 rounded-lg border border-solid border-[#e7e5ee] bg-[#faf9fc] px-2.5 text-[#7a7b89] sm:gap-2.5 sm:px-3 md:h-12 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0 [&>svg]:[fill:none] [&>svg]:[stroke:#7a7b89] [&>svg]:[stroke-width:1.8] [&>svg]:[stroke-linecap:round] [&_input]:w-full [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:text-xs [&_input]:text-[#242328] [&_input]:outline-none [&_input]:placeholder:text-[#9999a6] sm:[&_input]:text-sm [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-xl [&_button]:text-[#77747e] [&_button]:cursor-pointer"
            role="search"
            onSubmit={handleSearchSubmit}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
            <input
              type="search"
              aria-label="プロンプトを検索"
              placeholder="タイトルや内容を検索..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} aria-label="検索をクリア">
                ×
              </button>
            )}
          </form>
          {isLoggedIn ? (
            <button className={logoutButton} type="button" onClick={handleLogout}>
              ログアウト
            </button>
          ) : (
            <Link className={logoutButton} to="/login">
              ログイン
            </Link>
          )}
        </header>

        {logoutError && (
          <p className="mx-4 mb-0 mt-3 text-xs text-[#b42318] sm:mx-6 md:mx-8 lg:mx-14" role="alert">
            {logoutError}
          </p>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-7 sm:px-6 md:px-8 md:pb-14 md:pt-10 lg:px-14">
            <Outlet context={searchQuery} />
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}
