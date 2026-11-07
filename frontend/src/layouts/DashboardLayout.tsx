import { useEffect, useState } from 'react';
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
  'flex min-h-11 items-center justify-center rounded-lg p-0 text-xl hover:text-[#302058] sm:gap-3';
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `${navLinkBase} ${isActive ? 'bg-[#f0eef5] text-[#34265b] font-bold' : 'text-[#55535d]'}`;
const quickLink =
  '[&_a]:flex [&_a]:items-center [&_a]:gap-2 [&_a]:p-2.5 [&_a]:text-[#4c4a52] [&_a]:text-base [&_a:hover]:text-[#302058] [&_a_span:nth-child(2)]:flex-1';
const logoutButton =
  'flex-[0_0_auto] min-h-10 whitespace-nowrap rounded-lg border border-solid border-transparent bg-[#292633] px-3 py-0 text-xs font-bold text-white cursor-pointer hover:bg-[#3a3547] sm:min-h-12 sm:px-5 sm:text-sm';
const sidebarBreakpoint = '(min-width: 1024px)';

export default function DashboardLayout() {
  const [isNarrowViewport, setIsNarrowViewport] = useState(
    () => !window.matchMedia(sidebarBreakpoint).matches,
  );
  const [sidebarExpanded, setSidebarExpanded] = useState(
    () => window.matchMedia(sidebarBreakpoint).matches,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const { user, isLoggedIn, logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const mediaQuery = window.matchMedia(sidebarBreakpoint);
    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      setIsNarrowViewport(!event.matches);
      setSidebarExpanded(event.matches);
    };

    mediaQuery.addEventListener('change', handleBreakpointChange);
    return () => mediaQuery.removeEventListener('change', handleBreakpointChange);
  }, []);

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
    <div className="relative flex h-screen overflow-hidden bg-[#f8f8fa] font-sans text-[#242328]">
      {isNarrowViewport && sidebarExpanded && (
        <button
          type="button"
          className="fixed inset-0 z-20 cursor-default bg-[rgb(36_28_55/24%)]"
          aria-label="サイドバーを閉じる"
          onClick={() => setSidebarExpanded(false)}
        />
      )}
      <aside
        id="dashboard-sidebar"
        className={`${isNarrowViewport && sidebarExpanded ? 'fixed left-0 top-0 z-30 h-screen w-60 shadow-[4px_0_20px_rgb(36_28_55/14%)]' : 'sticky h-screen self-start'} flex ${sidebarExpanded ? 'basis-60 items-stretch px-4 pb-5 pt-7' : 'basis-14 px-1 py-4 sm:basis-16 sm:px-2'} flex-col overflow-y-auto border-r border-r-[#e9e8ec] bg-white`}
      >
        <div className={`mb-6 flex items-center sm:mb-8 ${sidebarExpanded ? 'justify-between' : 'justify-center'}`}>
          {sidebarExpanded && (
            <Link
              className="ml-1 flex items-center gap-3 whitespace-nowrap font-sans text-2xl font-extrabold tracking-tight text-[#20212a]"
              to="/"
              aria-label="Prompts ホーム"
            >
              <span className="inline-flex h-9 w-9 shrink-0 [&_svg]:h-full [&_svg]:w-full" aria-hidden="true">
                <svg viewBox="0 0 40 40">
                  <rect x="3" y="3" width="34" height="34" rx="11" fill="#6854d9" />
                  <path d="M11 8.5h10l5 5v18H11z" fill="#fff" />
                  <path d="M21 8.5v5h5M14.5 18h8M14.5 22h8M14.5 26h5" fill="none" stroke="#8a78e8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="m30.5 7 .9 3.1 3.1.9-3.1.9-.9 3.1-.9-3.1-3.1-.9 3.1-.9z" fill="#ffe08a" />
                </svg>
              </span>
              <span>Prompts</span>
            </Link>
          )}
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-solid border-[#e7e5ee] bg-white text-[#4c4a52] cursor-pointer hover:bg-[#f8f7fc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6854d9]"
            onClick={() => setSidebarExpanded((expanded) => !expanded)}
            aria-label={sidebarExpanded ? 'サイドバーを縮小' : 'サイドバーを拡大'}
            aria-expanded={sidebarExpanded}
            aria-controls="dashboard-sidebar"
            title={sidebarExpanded ? 'サイドバーを縮小' : 'サイドバーを拡大'}
          >
            <svg className="h-5 w-5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d={sidebarExpanded ? 'M9 4v16M15 12h4m-2-2 2 2-2 2' : 'M9 4v16M19 12h-4m2-2-2 2 2 2'} />
            </svg>
          </button>
        </div>

        <nav className={`grid w-full gap-1.5 ${sidebarExpanded ? 'mt-6' : 'mt-4'}`} aria-label="メインメニュー">
          {navigationItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              className={({ isActive }) =>
                `${navLinkClass({ isActive })} ${sidebarExpanded ? 'justify-start gap-3 px-3 text-sm [&>span:first-child]:text-lg' : '[&>span:last-child]:hidden'}`
              }
              end={end}
              to={to}
            >
              <span aria-hidden="true">{icon}</span><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={`mx-0 h-px bg-[#e9e8ec] ${sidebarExpanded ? 'mb-5 mt-6' : 'mb-4 mt-5'}`} />
        <section
          className={`${quickLink} ${sidebarExpanded ? '[&_a]:justify-start [&_a_span:nth-child(2)]:inline [&_a_span:nth-child(3)]:inline [&_h2]:mb-2.5 [&_h2]:ml-2.5 [&_h2]:mt-0 [&_h2]:block [&_h2]:text-base [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-widest [&_h2]:text-[#85838c]' : '[&_a]:justify-center [&_a_span:nth-child(2)]:hidden [&_a_span:nth-child(3)]:hidden [&_h2]:hidden'}`}
          aria-labelledby="quick-links-heading"
        >
          <h2 id="quick-links-heading">クイックリンク</h2>
          {quickLinks.map(({ href, label, icon }) => (
            <a key={href} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
              <span aria-hidden="true">{icon}</span><span>{label}</span><span aria-hidden="true">↗</span>
            </a>
          ))}
        </section>

        <div className={`mt-auto flex items-center gap-2.5 border-t border-t-[#e9e8ec] pt-3.5 ${sidebarExpanded ? 'px-1' : 'px-0'}`}>
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eee9f8] text-sm font-bold text-[#39266a]"
            aria-hidden="true"
          >
            {user?.name?.slice(0, 1) ?? 'G'}
          </span>
          <span className={`${sidebarExpanded ? 'inline' : 'hidden'} overflow-hidden text-sm text-ellipsis whitespace-nowrap text-[#514f58]`}>
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
          <main className="mx-auto w-full max-w-screen-2xl flex-1 px-3 pb-10 pt-7 sm:px-4 md:px-6 md:pb-14 md:pt-10 lg:px-8">
            <Outlet context={searchQuery} />
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}
