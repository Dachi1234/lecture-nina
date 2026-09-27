import type { ReactNode, SVGProps } from "react";

const paths = {
  card: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M10 8h4M10 12h4" />
    </>
  ),
  vocabulary: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 21V5M9 8h6" />
    </>
  ),
  dialogue: (
    <>
      <path d="M4 5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      <path d="M19 9h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-4-3h-3" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 10l5-3v10l-5-3" />
    </>
  ),
  audio: (
    <>
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
      <rect x="3" y="14" width="4" height="6" rx="1.5" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" />
    </>
  ),
  document: (
    <>
      <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  exercise: (
    <>
      <path d="M4 20l4-1 11-11-3-3L5 16z" />
      <path d="M14 6l3 3" />
    </>
  ),
  pronunciation: <path d="M3 12h2l2-5 3 10 3-12 3 9 2-2h3" />,
  grammar: (
    <>
      <path d="M5 4h14v9a7 7 0 0 1-14 0z" />
      <path d="M9 9h6M9 13h4" />
    </>
  ),
  homework: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  game: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9" r="1.2" />
      <circle cx="15" cy="15" r="1.2" />
      <circle cx="15" cy="9" r="1.2" />
      <circle cx="9" cy="15" r="1.2" />
    </>
  ),
  checkpoint: <path d="M5 21V4M5 4h11l-2 4 2 4H5" />,
  home: <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />,
  lessons: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  materials: (
    <>
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  progress: (
    <>
      <path d="M4 19c3-1 4-4 6-8s4-6 10-7" />
      <circle cx="4" cy="19" r="1.5" />
      <circle cx="11" cy="10" r="1.5" />
      <circle cx="20" cy="4" r="1.5" />
    </>
  ),
  restart: (
    <>
      <path d="M4 12a8 8 0 1 0 2.5-5.8" />
      <path d="M4 4v4h4" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="5" rx="1" />
      <path d="M5 13v7h14v-7M12 8v12M12 8c-1-3-5-4-5-1.5S10 8 12 8zM12 8c1-3 5-4 5-1.5S14 8 12 8z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.5c1.4-3.2 3.4-4.8 7-4.8s5.6 1.6 7 4.8" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  chevron: <path d="M9 6l6 6-6 6" />,
} as const;

export type IconName = keyof typeof paths;

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export function Icon({ name, width = 24, height = 24, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

export function IconTile({
  name,
  className,
  children,
}: {
  name: IconName;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex size-12 items-center justify-center rounded-xl ${className ?? ""}`}
    >
      <Icon name={name} width={22} height={22} />
      {children}
    </span>
  );
}
