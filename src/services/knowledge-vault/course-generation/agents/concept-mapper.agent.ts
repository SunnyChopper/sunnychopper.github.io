import { BaseAgent } from '../../../../lib/llm/langgraph/base-agent';
import type { CourseGenerationState, CourseGenerationStateUpdate } from '../types';

/**
 * Concept Mapper Agent
 * Role: Build and maintain concept dependency graph
 * Tracks concepts introduced in each lesson and their dependencies
 */
export class ConceptMapperAgent extends BaseAgent {
  constructor() {
    super('goalRefinement');
  }

  async execute(state: CourseGenerationState): Promise<CourseGenerationStateUpdate> {
    const conceptMap = this._collectConcepts(state);
    const dependencies = this._buildDependencies(state, conceptMap);
    this._calculateDepths(conceptMap);

    return {
      conceptGraph: {
        concepts: conceptMap,
        dependencies,
      },
      metadata: {
        ...state.metadata,
        currentPhase: 'validating',
        lastModified: new Date().toISOString(),
      },
    };
  }

  private _collectConcepts(state: CourseGenerationState): Map<
    string,
    {
      introducedIn: string;
      prerequisites: string[];
      usedIn: string[];
      depth: number;
    }
  > {
    const conceptMap = new Map<
      string,
      {
        introducedIn: string;
        prerequisites: string[];
        usedIn: string[];
        depth: number;
      }
    >();

    for (const module of state.modules) {
      for (const lesson of module.lessons) {
        for (const concept of lesson.keyConcepts) {
          if (!conceptMap.has(concept)) {
            conceptMap.set(concept, {
              introducedIn: lesson.id,
              prerequisites: [],
              usedIn: [],
              depth: 0,
            });
          } else {
            const node = conceptMap.get(concept)!;
            node.usedIn.push(lesson.id);
          }
        }
      }
    }

    return conceptMap;
  }

  private _buildDependencies(
    state: CourseGenerationState,
    conceptMap: Map<
      string,
      {
        introducedIn: string;
        prerequisites: string[];
        usedIn: string[];
        depth: number;
      }
    >
  ): Array<{
    from: string;
    to: string;
    type: 'prerequisite' | 'builds_on' | 'extends';
  }> {
    const dependencies: Array<{
      from: string;
      to: string;
      type: 'prerequisite' | 'builds_on' | 'extends';
    }> = [];

    for (const module of state.modules) {
      for (const lesson of module.lessons) {
        for (const concept of lesson.keyConcepts) {
          const conceptNode = conceptMap.get(concept);
          if (!conceptNode) continue;

          for (const prereq of lesson.prerequisites) {
            if (conceptMap.has(prereq)) {
              if (!conceptNode.prerequisites.includes(prereq)) {
                conceptNode.prerequisites.push(prereq);
              }
              dependencies.push({
                from: prereq,
                to: concept,
                type: 'prerequisite',
              });
            }
          }
        }
      }
    }

    return dependencies;
  }

  private _calculateDepths(
    conceptMap: Map<
      string,
      {
        introducedIn: string;
        prerequisites: string[];
        usedIn: string[];
        depth: number;
      }
    >
  ): void {
    const visited = new Set<string>();
    const visit = (concept: string, depth: number) => {
      if (visited.has(concept)) return;
      visited.add(concept);
      const node = conceptMap.get(concept);
      if (node) {
        node.depth = Math.max(node.depth, depth);
        for (const prereq of node.prerequisites) {
          visit(prereq, depth + 1);
        }
      }
    };
    for (const concept of conceptMap.keys()) {
      if (!visited.has(concept)) {
        visit(concept, 0);
      }
    }
  }
}
