import { useState } from 'react';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import type { SpecialistBrief } from '@/types/chatbot';

interface AssistantSpecialistBriefsListProps {
  briefs: SpecialistBrief[];
}

export function AssistantSpecialistBriefsList({ briefs }: AssistantSpecialistBriefsListProps) {
  const [open, setOpen] = useState(false);
  if (!briefs.length) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <Users className="h-3.5 w-3.5" />
        <span>Specialists consulted ({briefs.length})</span>
      </button>
      {open && (
        <ul className="mt-2 space-y-2 text-xs text-gray-600 dark:text-gray-300">
          {briefs.map((brief) => (
            <li
              key={brief.specialistId}
              className="rounded-md border border-gray-200 bg-gray-50/80 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <div className="font-medium text-gray-800 dark:text-gray-100">
                {brief.displayName}
              </div>
              <div className="mt-0.5 text-gray-600 dark:text-gray-400">{brief.headline}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
