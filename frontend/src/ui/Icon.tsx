const PATHS = {
  phone: 'M8 2.75h8A1.25 1.25 0 0 1 17.25 4v16A1.25 1.25 0 0 1 16 21.25H8A1.25 1.25 0 0 1 6.75 20V4A1.25 1.25 0 0 1 8 2.75Zm2.5 15.5h3',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0',
  tap: 'M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-2.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.6a5 5 0 0 1-3.9-1.9L4.4 15.4a1.5 1.5 0 0 1 2.3-1.9L9 15',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 4.3a3.5 3.5 0 0 1 0 6.4M17.5 14.7c2.1.6 3.5 2.6 3.5 5.3',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  building: 'M5 20.25V4.75h9v15.5M14 9.75h5v10.5M3 20.25h18M8 8h3M8 11.5h3M8 15h3',
  logout: 'M14 4.75h4.25v14.5H14M10 8l-4 4 4 4M6 12h9',
  plus: 'M12 5v14M5 12h14',
  pause: 'M9 5.5v13M15 5.5v13',
  play: 'M8 5.5v13l10-6.5z',
  stop: 'M6.5 6.5h11v11h-11z',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
}

export default function Icon({ name, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
