const pitchRows = [
  ['GKP'],
  ['DEF', 'DEF', 'DEF', 'DEF'],
  ['MID', 'MID', 'MID', 'MID'],
  ['FWD', 'FWD'],
];

const benchSlots = ['GKP', 'DEF', 'MID', 'FWD'];

function SquadSlot({ label }: { label: string }) {
  return (
    <button className="flex h-24 w-20 flex-col items-center justify-center rounded-lg border border-white/30 bg-white/15 text-white shadow-sm transition hover:bg-white/25">
      <span className="text-xs font-bold">{label}</span>
      <span className="mt-2 text-[10px] uppercase text-white/70">Pick player</span>
    </button>
  );
}

export default function FantasyPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">World Cup Fantasy</p>
          <h1 className="text-3xl font-bold text-gray-900">Create Squad</h1>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Points</p>
          <p className="text-2xl font-semibold text-gray-900">0</p>
        </div>
      </div>

      <div className="rounded-xl bg-green-700 p-4 shadow-sm">
        <div className="space-y-8 rounded-lg border-2 border-white/70 bg-green-600 px-4 py-8">
          {pitchRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-6">
              {row.map((slot, slotIndex) => (
                <SquadSlot key={`${slot}-${slotIndex}`} label={slot} />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-white/20 p-4">
          <p className="mb-3 text-center text-sm font-bold uppercase text-white">Substitutes</p>
          <div className="flex flex-wrap justify-center gap-4">
            {benchSlots.map((slot, index) => (
              <SquadSlot key={`${slot}-${index}`} label={slot} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
