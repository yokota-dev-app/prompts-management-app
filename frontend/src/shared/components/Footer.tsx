const FOOTER =
  'grid h-auto shrink-0 grid-cols-1 items-center gap-2 border-t border-[#efedf5] bg-white px-5 py-4 text-xs md:flex md:h-14 md:justify-between md:px-8 md:py-0 lg:px-20';
const NAV =
  'flex flex-wrap gap-4 text-[#777485] md:gap-5';

const footerLinks = [
  { href: '/terms', label: '利用規約' },
  { href: '/privacy', label: 'プライバシーポリシー' },
  { href: '/contact', label: 'お問い合わせ' },
];

export default function Footer() {
  return (
    <footer className={FOOTER}>
      <small className="text-sm text-[#8d8a98]">© {new Date().getFullYear()} Prompts</small>
      <nav className={NAV} aria-label="フッターメニュー">
        {footerLinks.map((link) => (
          <a className="hover:text-(--top-purple)" href={link.href} key={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
