// 아이콘 세트 — stroke 1.6, 20px 기본
const Icon = ({ children, size = 20, stroke = 1.6, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
       className={className} style={style}>
    {children}
  </svg>
);

const IconCalendar   = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></Icon>;
const IconMenu       = (p) => <Icon {...p}><path d="M3 6h18M3 12h18M3 18h18"/></Icon>;
const IconChart      = (p) => <Icon {...p}><path d="M3 3v18h18"/><path d="M7 15l4-6 4 4 5-8"/></Icon>;
const IconMegaphone  = (p) => <Icon {...p}><path d="M3 11v2a2 2 0 002 2h1l4 4V5L6 9H5a2 2 0 00-2 2z"/><path d="M14 8a5 5 0 010 8"/></Icon>;
const IconDots       = (p) => <Icon {...p}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></Icon>;
const IconStore      = (p) => <Icon {...p}><path d="M3 9l1-5h16l1 5"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/></Icon>;
const IconSearch     = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>;
const IconPlus       = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
const IconUser       = (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></Icon>;
const IconPhone      = (p) => <Icon {...p}><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.4 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.4c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/></Icon>;
const IconChevronL   = (p) => <Icon {...p}><path d="m15 18-6-6 6-6"/></Icon>;
const IconChevronR   = (p) => <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>;
const IconChevronD   = (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>;
const IconChevronU   = (p) => <Icon {...p}><path d="m18 15-6-6-6 6"/></Icon>;
const IconHelp       = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01"/></Icon>;
const IconSettings   = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z"/></Icon>;
const IconBell       = (p) => <Icon {...p}><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 003.4 0"/></Icon>;
const IconClock      = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
const IconCoffee     = (p) => <Icon {...p}><path d="M17 8h1a3 3 0 010 6h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4z"/><path d="M6 2v3M10 2v3M14 2v3"/></Icon>;
const IconTag        = (p) => <Icon {...p}><path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/></Icon>;
const IconNote       = (p) => <Icon {...p}><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M9 14h6M9 18h4"/></Icon>;
const IconTrend      = (p) => <Icon {...p}><path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></Icon>;
const IconGrid       = (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>;
const IconFilter     = (p) => <Icon {...p}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></Icon>;
const IconX          = (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>;
const IconCheck      = (p) => <Icon {...p}><path d="m5 12 5 5L20 7"/></Icon>;

Object.assign(window, {
  Icon,
  IconCalendar, IconMenu, IconChart, IconMegaphone, IconDots, IconStore,
  IconSearch, IconPlus, IconUser, IconPhone, IconChevronL, IconChevronR,
  IconChevronD, IconChevronU, IconHelp, IconSettings, IconBell, IconClock,
  IconCoffee, IconTag, IconNote, IconTrend, IconGrid, IconFilter, IconX, IconCheck,
});
