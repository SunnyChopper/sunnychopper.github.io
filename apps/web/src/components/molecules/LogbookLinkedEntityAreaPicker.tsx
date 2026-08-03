import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Goal, LogbookLinkedEntity, Project } from '@/types/growth-system';
import {
  areasWithLinkedEntities,
  groupLogbookEntitiesByArea,
  isLogbookEntityLinked,
  LOGBOOK_LINK_CHIP_DEFAULT_CLASS,
  LOGBOOK_LINK_CHIP_SELECTED_CLASS,
} from '@/lib/growth-system/logbook-linkable-entities';
import { cn } from '@/lib/utils';

interface LogbookLinkedEntityAreaPickerProps {
  projects: Project[];
  goals: Goal[];
  linkedEntities?: LogbookLinkedEntity[];
  onToggle: (entity: LogbookLinkedEntity) => void;
}

function entityChipClass(selected: boolean): string {
  return cn(
    'rounded-md border px-3 py-1 text-sm transition',
    selected ? LOGBOOK_LINK_CHIP_SELECTED_CLASS : LOGBOOK_LINK_CHIP_DEFAULT_CLASS
  );
}

export function LogbookLinkedEntityAreaPicker({
  projects,
  goals,
  linkedEntities = [],
  onToggle,
}: LogbookLinkedEntityAreaPickerProps) {
  const groupedAreas = useMemo(
    () => groupLogbookEntitiesByArea(projects, goals),
    [projects, goals]
  );
  const linkedAreaSet = useMemo(
    () => areasWithLinkedEntities(linkedEntities, projects, goals),
    [linkedEntities, projects, goals]
  );
  const [openAreas, setOpenAreas] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setOpenAreas((prev) => {
      const next = new Set(prev);
      for (const area of linkedAreaSet) {
        next.add(area);
      }
      return next;
    });
  }, [linkedAreaSet]);

  if (groupedAreas.length === 0) {
    return null;
  }

  const selectedCount = linkedEntities.length;

  return (
    <div className="space-y-3">
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Selected
          </span>
          {linkedEntities.map((entity) => (
            <button
              key={`${entity.entityType}-${entity.entityId}`}
              type="button"
              onClick={() => onToggle(entity)}
              className={entityChipClass(true)}
            >
              {entity.entityName}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {groupedAreas.map(({ area, projects: areaProjects, goals: areaGoals }) => {
          const isOpen = openAreas.has(area);
          const areaCount = areaProjects.length + areaGoals.length;
          return (
            <div
              key={area}
              className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenAreas((prev) => {
                    const next = new Set(prev);
                    if (next.has(area)) next.delete(area);
                    else next.add(area);
                    return next;
                  })
                }
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                )}
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                  {area}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{areaCount}</span>
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-gray-200 px-3 py-3 dark:border-gray-700">
                  {areaProjects.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Projects
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {areaProjects.map((project) => {
                          const selected = isLogbookEntityLinked(
                            linkedEntities,
                            'project',
                            project.id
                          );
                          return (
                            <button
                              key={`project-${project.id}`}
                              type="button"
                              onClick={() =>
                                onToggle({
                                  entityType: 'project',
                                  entityId: project.id,
                                  entityName: project.name,
                                })
                              }
                              className={entityChipClass(selected)}
                            >
                              {project.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {areaGoals.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Goals
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {areaGoals.map((goal) => {
                          const selected = isLogbookEntityLinked(linkedEntities, 'goal', goal.id);
                          return (
                            <button
                              key={`goal-${goal.id}`}
                              type="button"
                              onClick={() =>
                                onToggle({
                                  entityType: 'goal',
                                  entityId: goal.id,
                                  entityName: goal.title,
                                })
                              }
                              className={entityChipClass(selected)}
                            >
                              {goal.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
