import { motion } from 'framer-motion';

// ─── SVG Icons ─────────────────────────────────────────────────────────────

function SunIcon({ active }) {
  const c = active ? 'var(--primary)' : 'var(--muted-foreground)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2"    x2="12" y2="5.5" />
      <line x1="12" y1="18.5" x2="12" y2="22" />
      <line x1="4.22"  y1="4.22"  x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2"  y1="12" x2="5.5" y2="12" />
      <line x1="18.5" y1="12" x2="22" y2="12" />
      <line x1="4.22"  y1="19.78" x2="6.34"  y2="17.66" />
      <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ active }) {
  const c = active ? '#7EB2FF' : 'var(--muted-foreground)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MapIcon({ active }) {
  const c = active ? 'var(--primary)' : 'var(--muted-foreground)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8"  y1="2"  x2="8"  y2="18" />
      <line x1="16" y1="6"  x2="16" y2="22" />
    </svg>
  );
}

function FeedIcon({ active }) {
  const c = active ? 'var(--primary)' : 'var(--muted-foreground)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3"  y="3"  width="7" height="7" rx="1.5" />
      <rect x="14" y="3"  width="7" height="7" rx="1.5" />
      <rect x="3"  y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function BellIcon({ active }) {
  const c = active ? 'var(--primary)' : 'var(--muted-foreground)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function LiveIcon({ active }) {
  const c = active ? '#FF4545' : 'var(--muted-foreground)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" fill={active ? '#FF4545' : 'none'} />
      <path d="M6.3 6.3a8 8 0 0 0 0 11.4" />
      <path d="M17.7 6.3a8 8 0 0 1 0 11.4" />
      <path d="M9.5 9.5a4 4 0 0 0 0 5" />
      <path d="M14.5 9.5a4 4 0 0 1 0 5" />
    </svg>
  );
}

// ─── Tab definitions ────────────────────────────────────────────────────────

const TABS = [
  { id: 'today',  label: 'Sun',    Icon: SunIcon,  activeColor: 'var(--primary)' },
  { id: 'moon',   label: 'Moon',   Icon: MoonIcon, activeColor: '#7EB2FF' },
  { id: 'map',    label: 'Map',    Icon: MapIcon,  activeColor: 'var(--primary)' },
  { id: 'feed',   label: 'Stories', Icon: FeedIcon, activeColor: 'var(--primary)' },
  { id: 'live',   label: 'Live',   Icon: LiveIcon, activeColor: '#FF4545' },
  { id: 'alerts', label: 'Alerts', Icon: BellIcon, activeColor: 'var(--primary)' },
];

// ─── Dock component ─────────────────────────────────────────────────────────

export default function Dock({ active, onChange, mode = 'sun' }) {
  // Hide the opposite content tab based on active mode
  const visibleTabs = TABS.filter(({ id }) => {
    if (mode === 'sun'  && id === 'moon')  return false;
    if (mode === 'moon' && id === 'today') return false;
    return true;
  });

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(8, 8, 8, 0.82)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderTop: '0.5px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      <div
        className="flex items-center justify-around"
        style={{
          maxWidth: '520px',
          marginInline: 'auto',
          paddingTop: '10px',
          paddingBottom: 'max(18px, env(safe-area-inset-bottom))',
        }}
      >
        {visibleTabs.map(({ id, label, Icon, activeColor }) => {
          const isActive = active === id;

          return (
            <motion.button
              key={id}
              onClick={() => onChange(id)}
              whileTap={{ scale: 0.82 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="relative flex flex-col items-center gap-[5px] px-2 py-1"
              style={{ minWidth: '52px' }}
              aria-label={label}
            >
              {/* Icon */}
              <Icon active={isActive} />

              {/* Label */}
              <span
                className="text-[10px] font-medium tracking-wide"
                style={{
                  color: isActive ? activeColor : 'var(--muted-foreground)',
                  transition: 'color 200ms ease',
                }}
              >
                {label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.span
                  layoutId="dock-indicator"
                  className="absolute -bottom-[3px] w-1 h-1 rounded-full"
                  style={{ background: activeColor }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
