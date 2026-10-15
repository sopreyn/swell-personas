// Small inline icons used by the Practice Room. All are decorative (aria-hidden).

export function WaveMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M2 13.5c2.6 0 2.6-4 5.2-4s2.6 4 5.2 4 2.6-4 5.2-4c1 0 1.6.6 2.2 1.3"
        stroke="#F1653D"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M2 18c2.6 0 2.6-3 5.2-3s2.6 3 5.2 3 2.6-3 5.2-3c1 0 1.6.4 2.2 1"
        stroke="#F4A73D"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity=".7"
      />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronIcon() {
  return (
    <svg className="chev" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
      <path d="M2 4.5h13M2 8.5h13M2 12.5h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 13V3M3.5 7.5 8 3l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
