import { cn } from '@/src/utils/merge';

const FANTASY_FLAG_CODES: Record<string, string> = {
  ALG: 'dz',
  ARG: 'ar',
  AUS: 'au',
  AUT: 'at',
  BEL: 'be',
  BOS: 'ba',
  BRA: 'br',
  CAN: 'ca',
  CAP: 'cv',
  COL: 'co',
  CON: 'cd',
  CRO: 'hr',
  CUR: 'cw',
  CZE: 'cz',
  ECU: 'ec',
  EGY: 'eg',
  ENG: 'gb-eng',
  FRA: 'fr',
  GER: 'de',
  GHA: 'gh',
  HAI: 'ht',
  IRA: 'ir',
  IRQ: 'iq',
  IVO: 'ci',
  JAP: 'jp',
  JOR: 'jo',
  KOR: 'kr',
  MEX: 'mx',
  MOR: 'ma',
  NET: 'nl',
  NOR: 'no',
  NZL: 'nz',
  PAN: 'pa',
  PAR: 'py',
  POR: 'pt',
  QAT: 'qa',
  SAU: 'sa',
  SCO: 'gb-sct',
  SEN: 'sn',
  SOU: 'za',
  SPA: 'es',
  SWE: 'se',
  SWI: 'ch',
  TUN: 'tn',
  TUR: 'tr',
  URU: 'uy',
  USA: 'us',
  UZB: 'uz',
};

type FantasyCountryFlagProps = {
  countryCode: string;
  label?: string;
  className?: string;
  fallbackClassName?: string;
};

export default function FantasyCountryFlag({
  countryCode,
  label,
  className,
  fallbackClassName,
}: FantasyCountryFlagProps) {
  const flagCode = FANTASY_FLAG_CODES[countryCode];

  if (!flagCode) {
    return (
      <span className={fallbackClassName ?? className}>
        {countryCode}
      </span>
    );
  }

  return (
    <span
      aria-label={`${label ?? countryCode} flag`}
      className={cn('fi', `fi-${flagCode}`, className)}
      role="img"
      title={countryCode}
    />
  );
}
