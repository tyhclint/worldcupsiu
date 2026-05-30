import { TEAM_FLAG_CODES } from '@/src/lib/flagCodes';
import { cn } from '@/src/utils/merge';

type FlagIconProps = {
  teamId: string;
  label: string;
  className?: string;
};

export default function FlagIcon({ teamId, label, className }: FlagIconProps) {
  const code = TEAM_FLAG_CODES[teamId];

  if (!code) return null;

  return (
    <span
      aria-label={`${label} flag`}
      className={cn('fi', `fi-${code}`, className)}
      role="img"
    />
  );
}
