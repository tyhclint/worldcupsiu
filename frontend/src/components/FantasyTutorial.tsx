export default function FantasyTutorialModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">How to Play</h2>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-900">1</span>
            <p><strong>Draft your 16 players:</strong> Tap on the empty slots on the pitch to fill your starting 11 and your 5 bench players.</p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-900">2</span>
            <p><strong>Choose your formation:</strong> Drag and drop players into your chosen formation. You are the manager</p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-900">3</span>
            <p><strong>Stay within limits:</strong> You can only select a maximum of <strong>1 player</strong> from any single national team.</p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-900">4</span>
            <p><strong>Score points:</strong> Once your squad is full, click Submit. You can then Score your squad based on their real-world World Cup match ratings!</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-md bg-black px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-800"
        >
          Got it, let's play
        </button>
      </div>
    </div>
  );
}