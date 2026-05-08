import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { BONUS_TOPIC_OPTIONS } from "../bonusStages";
import type { BonusTopicId } from "../bonusStages/types";

export function TeacherBonusModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (displayName: string, topicId: BonusTopicId) => void;
}) {
  const [name, setName] = useState("");
  const [topicId, setTopicId] = useState<BonusTopicId>("forLoops");

  useEffect(() => {
    if (open) {
      setName("");
      setTopicId("forLoops");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-labelledby="teacher-bonus-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-cyan-500/35 bg-slate-900 p-5 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
        <h2 id="teacher-bonus-title" className="text-lg font-semibold tracking-tight text-cyan-100">
          Create Bonus Stage
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Picks a fixed template — nothing is generated or saved remotely.
        </p>
        <label className="mt-4 block text-xs font-medium text-slate-300">
          Stage name
          <input
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/30 focus:ring-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., After-school drill"
            autoFocus
          />
        </label>
        <label className="mt-3 block text-xs font-medium text-slate-300">
          Topic
          <select
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/30 focus:ring-2"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value as BonusTopicId)}
          >
            {BONUS_TOPIC_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" className="border border-slate-600" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onCreate(name, topicId);
              onClose();
            }}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
