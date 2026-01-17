import { StateGraph, START, END, Annotation } from '@langchain/langgraph/web';
import type {
  CourseGenerationState,
  CourseGenerationStateUpdate,
  CourseGenerationInput,
  CourseGenerationProgress,
  ConceptNode,
} from './types';
import { CourseStrategistAgent } from './agents/course-strategist.agent';
import { ModuleArchitectAgent } from './agents/module-architect.agent';
import { ConceptMapperAgent } from './agents/concept-mapper.agent';
import { FlowValidatorAgent } from './agents/flow-validator.agent';
import { RefinementAgent } from './agents/refinement-agent';
import { ContentGeneratorAgent } from './agents/content-generator.agent';

// Global progress callback (set before graph execution)
let progressCallback: ((progress: CourseGenerationProgress) => void) | null = null;

// Global input storage as backup in case state serialization fails
let storedInput: CourseGenerationInput | null = null;

// Global state cache as backup in case LangGraph serialization loses state
// This is a workaround for LangGraph web serialization issues
let globalStateCache: CourseGenerationState | null = null;

export function setGlobalStateCache(state: CourseGenerationState | null) {
  globalStateCache = state;
}

export function getGlobalStateCache(): CourseGenerationState | null {
  return globalStateCache;
}

export function setProgressCallback(callback: (progress: CourseGenerationProgress) => void) {
  progressCallback = callback;
}

export function setStoredInput(input: CourseGenerationInput) {
  storedInput = input;
}

export function getStoredInput(): CourseGenerationInput | null {
  return storedInput;
}

function emitProgress(progress: CourseGenerationProgress) {
  if (progressCallback) {
    progressCallback(progress);
  }
}

/**
 * Validate and normalize state to ensure all required properties exist
 * This prevents undefined errors when state is lost during serialization
 */
function validateState(state: CourseGenerationState): CourseGenerationState {
  const defaultState = getDefaultState();

  return {
    course:
      state.course && typeof state.course === 'object'
        ? { ...defaultState.course, ...state.course }
        : defaultState.course,
    modules: Array.isArray(state.modules) ? state.modules : defaultState.modules,
    conceptGraph: state.conceptGraph
      ? {
          concepts:
            state.conceptGraph.concepts instanceof Map
              ? state.conceptGraph.concepts
              : state.conceptGraph.concepts &&
                  typeof state.conceptGraph.concepts === 'object' &&
                  !Array.isArray(state.conceptGraph.concepts)
                ? new Map(
                    Object.entries(state.conceptGraph.concepts as Record<string, ConceptNode>)
                  )
                : defaultState.conceptGraph.concepts,
          dependencies: Array.isArray(state.conceptGraph.dependencies)
            ? state.conceptGraph.dependencies
            : defaultState.conceptGraph.dependencies,
        }
      : defaultState.conceptGraph,
    alignment:
      state.alignment && typeof state.alignment === 'object'
        ? { ...defaultState.alignment, ...state.alignment }
        : defaultState.alignment,
    metadata:
      state.metadata && typeof state.metadata === 'object'
        ? {
            ...defaultState.metadata,
            ...state.metadata,
            // Preserve input if it exists
            input: state.metadata.input ?? defaultState.metadata.input,
            // CRITICAL: Preserve iterations to prevent loop reset
            iterations:
              typeof state.metadata.iterations === 'number'
                ? state.metadata.iterations
                : defaultState.metadata.iterations,
          }
        : defaultState.metadata,
  };
}

/**
 * State reducer for LangGraph workflow
 * Properly merges partial state updates from agents
 */
// Default initial state for reducer fallback
const getDefaultState = (): CourseGenerationState => ({
  course: {
    title: '',
    description: '',
    difficulty: 'intermediate',
    estimatedHours: 0,
    learningObjectives: [],
    prerequisites: [],
  },
  modules: [],
  conceptGraph: {
    concepts: new Map(),
    dependencies: [],
  },
  alignment: {
    lessonTransitions: [],
    overallScore: 0,
    issues: [],
  },
  metadata: {
    currentPhase: 'strategizing',
    iterations: 0,
    lastModified: new Date().toISOString(),
  },
});

const CourseGenerationAnnotation = Annotation.Root({
  reducer: (
    x: CourseGenerationState | undefined,
    y: CourseGenerationStateUpdate | undefined
  ): CourseGenerationState => {
    // Log what we're receiving for debugging
    console.log('Reducer called with:', {
      hasX: !!x,
      hasY: !!y,
      xKeys: x ? Object.keys(x) : [],
      yKeys: y ? Object.keys(y) : [],
      yHasMetadata: !!y?.metadata,
      yHasInput: !!y?.metadata?.input,
      xHasModules: !!x?.modules,
      xModulesIsArray: Array.isArray(x?.modules),
      xModulesCount: Array.isArray(x?.modules) ? x.modules.length : 'not array',
      yHasModules: !!y?.modules,
      yModulesIsArray: Array.isArray(y?.modules),
      yModulesCount: Array.isArray(y?.modules) ? y.modules.length : 'not array',
    });

    // CRITICAL: Handle initial state passed via invoke()
    // When graph.invoke(initialState) is called, LangGraph passes:
    // - x = undefined (no previous state)
    // - y = initialState (the state passed to invoke)
    // We MUST handle this case first before checking for empty states
    if (!x && y) {
      // Check if y looks like a full state object (has state properties)
      const yKeys = Object.keys(y);
      const hasStateProperties =
        yKeys.length > 0 &&
        ('metadata' in y ||
          'course' in y ||
          'modules' in y ||
          'conceptGraph' in y ||
          'alignment' in y);

      if (hasStateProperties) {
        console.log(
          'Reducer: Initial state passed as y, using y as base. Keys:',
          yKeys,
          'yHasMetadata:',
          !!y.metadata,
          'yHasInput:',
          !!y.metadata?.input
        );
        // Ensure y has all required properties, merging with defaults
        const defaultState = getDefaultState();
        const initialState: CourseGenerationState = {
          course:
            y.course && typeof y.course === 'object'
              ? { ...defaultState.course, ...y.course }
              : defaultState.course,
          modules: Array.isArray(y.modules) ? y.modules : defaultState.modules,
          conceptGraph: y.conceptGraph
            ? {
                concepts:
                  y.conceptGraph.concepts instanceof Map
                    ? y.conceptGraph.concepts
                    : y.conceptGraph.concepts &&
                        typeof y.conceptGraph.concepts === 'object' &&
                        !Array.isArray(y.conceptGraph.concepts)
                      ? new Map(
                          Object.entries(y.conceptGraph.concepts as Record<string, ConceptNode>)
                        )
                      : defaultState.conceptGraph.concepts,
                dependencies: Array.isArray(y.conceptGraph.dependencies)
                  ? y.conceptGraph.dependencies
                  : defaultState.conceptGraph.dependencies,
              }
            : defaultState.conceptGraph,
          alignment:
            y.alignment && typeof y.alignment === 'object'
              ? { ...defaultState.alignment, ...y.alignment }
              : defaultState.alignment,
          metadata:
            y.metadata && typeof y.metadata === 'object'
              ? { ...defaultState.metadata, ...y.metadata }
              : defaultState.metadata,
        };

        // CRITICAL: Ensure metadata.input is preserved if it exists in y
        if (y.metadata?.input) {
          initialState.metadata.input = y.metadata.input;
        }

        // CRITICAL: Preserve iterations if it exists in y.metadata
        if (typeof y.metadata?.iterations === 'number') {
          initialState.metadata.iterations = y.metadata.iterations;
        }

        console.log(
          'Reducer: Returning initial state. Has metadata:',
          !!initialState.metadata,
          'Has input:',
          !!initialState.metadata.input,
          'Has iterations:',
          typeof initialState.metadata.iterations === 'number'
            ? initialState.metadata.iterations
            : 'none'
        );
        return initialState;
      }
    }

    // Handle case where x (previous state) is undefined during initialization
    // This can happen when LangGraph validates the schema during graph construction
    // OR when the initial state is passed as y with x being undefined
    let prevState = x ?? getDefaultState();

    // CRITICAL: Check if prevState is empty/corrupted (LangGraph serialization issue)
    // If prevState exists but has no keys, it means serialization lost all properties
    if (prevState && Object.keys(prevState).length === 0) {
      console.error(
        'Reducer: prevState (x) is empty object! Attempting recovery from global cache...'
      );
      // Try to recover from global state cache
      const cachedState = getGlobalStateCache();
      if (cachedState && Object.keys(cachedState).length > 0) {
        console.log('Reducer: Recovered state from global cache', {
          hasModules: !!cachedState.modules,
          modulesCount: Array.isArray(cachedState.modules)
            ? cachedState.modules.length
            : 'not array',
        });
        prevState = cachedState;
      } else {
        console.error('Reducer: Global cache also empty, using default state');
        prevState = getDefaultState();
      }
    }

    // CRITICAL: Validate and normalize prevState to ensure modules are preserved
    // LangGraph may serialize/deserialize state, causing modules to be lost
    if (prevState && !Array.isArray(prevState.modules)) {
      console.warn('Reducer: prevState.modules is not an array!', {
        hasModules: !!prevState.modules,
        modulesType: typeof prevState.modules,
        modulesValue: prevState.modules,
        prevStateKeys: Object.keys(prevState),
      });
      // Try to recover from default state
      const defaultState = getDefaultState();
      prevState = {
        ...defaultState,
        ...prevState,
        modules: Array.isArray(prevState.modules) ? prevState.modules : defaultState.modules,
      };
    }

    // Defensive: ensure prevState always has metadata
    if (!prevState.metadata) {
      console.warn('Reducer: prevState missing metadata, adding default');
      prevState = {
        ...prevState,
        metadata: getDefaultState().metadata,
      };
    }

    // Handle case where y (update) is undefined
    if (!y) {
      // If y is undefined but x is also undefined, we're in graph construction/validation
      // During graph construction, LangGraph may call the reducer to validate the schema
      // We return a minimal valid state structure, but this won't affect the actual execution
      // because invoke() will pass the initial state which will be handled above
      if (!x) {
        const defaultState = getDefaultState();
        console.log(
          'Reducer: Returning default state (both x and y undefined - graph construction/validation)'
        );
        return defaultState;
      }
      // CRITICAL: If we have a previous state, preserve it completely (including iterations)
      // This prevents state loss during LangGraph's internal serialization
      console.log(
        'Reducer: y undefined, preserving prevState with iterations=',
        prevState.metadata?.iterations
      );
      return prevState;
    }

    // If y is an empty object (not undefined), this might be a serialization issue
    // Check if it's truly empty
    const yKeys = Object.keys(y);
    if (yKeys.length === 0 && !x) {
      // Empty object with no previous state - likely graph construction
      const defaultState = getDefaultState();
      console.log('Reducer: y is empty object, returning default state (graph construction)');
      return defaultState;
    }

    // If we reach here, we have both x and y, so this is a normal state update
    // Log if y has input (this might be a state update with input preserved)
    if (y.metadata?.input) {
      console.log('Reducer: Received update with input');
    }

    // Merge metadata FIRST and ALWAYS - this is critical for preserving input
    // Ensure we always have a valid metadata object - defensive check
    if (!prevState.metadata) {
      console.warn('Previous state missing metadata, using default');
      prevState = {
        ...prevState,
        metadata: getDefaultState().metadata,
      };
    }

    const prevMetadata = prevState.metadata;
    const prevIterations =
      typeof prevMetadata.iterations === 'number' ? prevMetadata.iterations : 0;
    const newIterations =
      typeof y.metadata?.iterations === 'number' ? y.metadata.iterations : undefined;

    // CRITICAL: Always preserve the maximum iterations value to prevent reset
    // This ensures iterations can only increase, never decrease
    const finalIterations =
      newIterations !== undefined ? Math.max(newIterations, prevIterations) : prevIterations;

    const mergedMetadata: CourseGenerationState['metadata'] = {
      ...prevMetadata,
      ...(y.metadata || {}),
      // CRITICAL: Always preserve input from previous state if new metadata doesn't have it
      input: y.metadata?.input !== undefined ? y.metadata.input : prevMetadata.input,
      // Ensure required fields are always present
      currentPhase: y.metadata?.currentPhase ?? prevMetadata.currentPhase,
      // CRITICAL: Preserve iterations - explicitly set to prevent any loss
      iterations: finalIterations,
      lastModified: y.metadata?.lastModified ?? prevMetadata.lastModified,
    };

    // Debug logging for iterations preservation
    if (prevIterations > 0 || newIterations !== undefined || finalIterations > 0) {
      console.log(
        `Reducer: Iterations - prev=${prevIterations}, new=${newIterations}, final=${finalIterations}, yHasMetadata=${!!y.metadata}, yMetadataKeys=${y.metadata ? Object.keys(y.metadata).join(',') : 'none'}`
      );
    }

    // Build merged state with explicit property merging
    // IMPORTANT: Explicitly construct each property to avoid undefined overwrites
    const mergedState: CourseGenerationState = {
      // Explicitly merge course
      course: y.course
        ? {
            ...prevState.course,
            ...y.course,
          }
        : prevState.course,
      // Explicitly merge modules array (replace if provided)
      // CRITICAL: Always preserve modules from previous state unless explicitly replaced
      // This prevents state loss during serialization between nodes
      modules: (() => {
        // If update explicitly provides modules array, use it
        if (Array.isArray(y.modules)) {
          console.log('Reducer: Using modules from y (update)', { count: y.modules.length });
          return y.modules;
        }
        // Otherwise, preserve previous state modules (even if empty)
        // This is critical - nodes that don't modify modules should not cause loss
        if (Array.isArray(prevState.modules)) {
          console.log('Reducer: Preserving modules from prevState', {
            count: prevState.modules.length,
          });
          return prevState.modules;
        }
        // Last resort: empty array (should rarely happen)
        console.error('Reducer: Both y.modules and prevState.modules are invalid!', {
          yModulesType: typeof y.modules,
          yModulesValue: y.modules,
          prevStateModulesType: typeof prevState.modules,
          prevStateModulesValue: prevState.modules,
          prevStateKeys: Object.keys(prevState),
        });
        return [];
      })(),
      // Merge concept graph - handle Map serialization issues
      conceptGraph: (() => {
        if (!y.conceptGraph) {
          return prevState.conceptGraph;
        }

        // Ensure concepts is a Map
        let concepts: Map<string, ConceptNode>;
        if (y.conceptGraph.concepts instanceof Map) {
          concepts = y.conceptGraph.concepts;
        } else if (y.conceptGraph.concepts && typeof y.conceptGraph.concepts === 'object') {
          // If it was serialized as a plain object, convert back to Map
          concepts = new Map(
            Object.entries(y.conceptGraph.concepts as Record<string, ConceptNode>)
          );
        } else {
          concepts = prevState.conceptGraph.concepts;
        }

        return {
          concepts: concepts.size > 0 ? concepts : prevState.conceptGraph.concepts,
          dependencies:
            y.conceptGraph.dependencies?.length > 0
              ? y.conceptGraph.dependencies
              : prevState.conceptGraph.dependencies,
        };
      })(),
      // Merge alignment
      alignment: y.alignment
        ? {
            ...prevState.alignment,
            ...y.alignment,
            lessonTransitions:
              y.alignment.lessonTransitions ?? prevState.alignment.lessonTransitions,
            issues: y.alignment.issues ?? prevState.alignment.issues,
          }
        : prevState.alignment,
      // Merge metadata - ALWAYS set this explicitly to ensure it's never undefined
      // This MUST be set and must never be undefined
      metadata: mergedMetadata,
    };

    // Final defensive check: ensure metadata is always present
    if (!mergedState.metadata) {
      console.error('Reducer produced state without metadata!', { x, y, mergedState });
      mergedState.metadata = getDefaultState().metadata;
    }

    // CRITICAL: Ensure we never return an empty state
    // If for some reason the state is empty, return default state
    const stateKeys = Object.keys(mergedState);
    if (stateKeys.length === 0) {
      console.error(
        'Reducer returning empty state! This should not happen. Returning default state.'
      );
      return getDefaultState();
    }

    // Ensure all required properties exist
    if (
      !mergedState.course ||
      !mergedState.conceptGraph ||
      !mergedState.alignment ||
      !mergedState.metadata
    ) {
      console.error('Reducer state missing required properties. Merging with defaults.');
      const defaultState = getDefaultState();
      return {
        course: mergedState.course || defaultState.course,
        modules: Array.isArray(mergedState.modules) ? mergedState.modules : defaultState.modules,
        conceptGraph: mergedState.conceptGraph || defaultState.conceptGraph,
        alignment: mergedState.alignment || defaultState.alignment,
        metadata: mergedState.metadata || defaultState.metadata,
      };
    }

    // CRITICAL: Explicitly ensure modules is always an array
    // This is a final safety check - if modules were lost during serialization, we try to recover
    if (!Array.isArray(mergedState.modules)) {
      console.error('Reducer: modules is not an array in mergedState! Attempting recovery...', {
        modules: mergedState.modules,
        type: typeof mergedState.modules,
        prevStateHadModules: Array.isArray(prevState.modules),
        prevStateModulesCount: Array.isArray(prevState.modules) ? prevState.modules.length : 0,
        yHadModules: Array.isArray(y.modules),
        yModulesCount: Array.isArray(y.modules) ? y.modules.length : 0,
      });
      // Try to recover from prevState first
      if (Array.isArray(prevState.modules)) {
        console.log('Reducer: Recovering modules from prevState', {
          count: prevState.modules.length,
        });
        mergedState.modules = prevState.modules;
      } else {
        // Last resort: empty array
        mergedState.modules = [];
      }
    }

    // Final validation: ensure mergedState has all required properties
    // Use validateState to normalize the final result
    const finalValidatedState = validateState(mergedState);

    // Log final state for debugging
    console.log('Reducer: Returning merged state', {
      hasModules: !!finalValidatedState.modules,
      modulesCount: Array.isArray(finalValidatedState.modules)
        ? finalValidatedState.modules.length
        : 'not array',
      hasCourse: !!finalValidatedState.course,
      hasMetadata: !!finalValidatedState.metadata,
      hasInput: !!finalValidatedState.metadata?.input,
    });

    // CRITICAL: Ensure alignment always has required properties
    if (!mergedState.alignment || typeof mergedState.alignment !== 'object') {
      console.warn('Reducer: alignment missing or invalid, using default');
      mergedState.alignment = getDefaultState().alignment;
    } else {
      // Ensure alignment has all required properties
      const defaultAlignment = getDefaultState().alignment;
      mergedState.alignment = {
        lessonTransitions:
          mergedState.alignment.lessonTransitions ?? defaultAlignment.lessonTransitions,
        overallScore:
          typeof mergedState.alignment.overallScore === 'number'
            ? mergedState.alignment.overallScore
            : defaultAlignment.overallScore,
        issues: Array.isArray(mergedState.alignment.issues)
          ? mergedState.alignment.issues
          : defaultAlignment.issues,
      };
    }

    // CRITICAL: Update global state cache to help recover from serialization issues
    // This is a workaround for LangGraph web serialization problems
    if (finalValidatedState && Object.keys(finalValidatedState).length > 0) {
      setGlobalStateCache(finalValidatedState);
    }

    return finalValidatedState;
  },
} as any);

/**
 * Conditional edge function to determine if refinement is needed
 */
// Track iterations outside of state to prevent loss during serialization
let globalIterationCounter = 0;

function shouldRefine(state: CourseGenerationState): 'refine' | 'generate_content' {
  console.log('shouldRefine: Called', {
    hasState: !!state,
    stateKeys: state ? Object.keys(state) : [],
    hasAlignment: !!state?.alignment,
    hasMetadata: !!state?.metadata,
  });

  try {
    // Defensive: validate state structure before accessing properties
    const validatedState = validateState(state);

    // Log raw state for debugging
    const rawIterations = state.metadata?.iterations;
    const validatedIterations = validatedState.metadata.iterations || 0;

    // CRITICAL: Use global counter as fallback if state iterations are lost
    // This prevents infinite loops when LangGraph serialization loses state
    const effectiveIterations =
      validatedIterations > 0 ? validatedIterations : globalIterationCounter;

    console.log(
      `shouldRefine: raw=${rawIterations}, validated=${validatedIterations}, global=${globalIterationCounter}, effective=${effectiveIterations}`,
      {
        hasAlignment: !!validatedState.alignment,
        overallScore: validatedState.alignment?.overallScore,
        scoreType: typeof validatedState.alignment?.overallScore,
      }
    );

    // If alignment doesn't exist or overallScore is undefined, proceed to content generation
    // This handles cases where state was lost during serialization
    if (!validatedState.alignment || typeof validatedState.alignment.overallScore !== 'number') {
      console.warn(
        'shouldRefine: alignment or overallScore missing, proceeding to content generation',
        {
          hasAlignment: !!validatedState.alignment,
          overallScore: validatedState.alignment?.overallScore,
          scoreType: typeof validatedState.alignment?.overallScore,
        }
      );
      return 'generate_content';
    }

    const score = validatedState.alignment.overallScore;
    const iterations = effectiveIterations;

    // If score is good enough, proceed to content generation
    if (score >= 0.8) {
      console.log('shouldRefine: Score is good enough, proceeding to content generation', {
        score,
        iterations,
      });
      return 'generate_content';
    }

    // Limit iterations to prevent infinite loops
    // After 2 iterations, proceed even if score isn't perfect
    if (iterations >= 2) {
      console.log(
        `shouldRefine: Max iterations (${iterations}) reached, proceeding to content generation`,
        { score }
      );
      globalIterationCounter = 0; // Reset for next course generation
      return 'generate_content';
    }

    // If score is very low (< 0.3), don't refine more than once
    if (score < 0.3 && iterations >= 1) {
      console.log(
        `shouldRefine: Low score (${score}) after ${iterations} iterations, proceeding to content generation`
      );
      globalIterationCounter = 0; // Reset for next course generation
      return 'generate_content';
    }

    console.log(`shouldRefine: Proceeding with refinement (iteration ${iterations + 1})`, {
      score,
      iterations,
    });
    return 'refine';
  } catch (error) {
    console.error('shouldRefine: Error during evaluation', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    // On error, proceed to content generation to avoid blocking
    console.warn('shouldRefine: Error occurred, proceeding to content generation as fallback');
    return 'generate_content';
  }
}

/**
 * Node: Course Strategist
 */
async function courseStrategistNode(
  state: CourseGenerationState
): Promise<CourseGenerationStateUpdate> {
  console.log('courseStrategistNode: Starting execution', {
    hasState: !!state,
    stateKeys: state ? Object.keys(state) : [],
    hasMetadata: !!state?.metadata,
    hasInput: !!state?.metadata?.input,
  });

  // CRITICAL: Detect if state is empty/corrupted (LangGraph serialization issue)
  if (state && Object.keys(state).length === 0) {
    console.error(
      'courseStrategistNode: Received empty state object! This indicates LangGraph serialization issue.'
    );
    // Try to recover from stored input
    const storedInput = getStoredInput();
    if (storedInput) {
      console.warn('courseStrategistNode: Recovering from stored input');
      state = initializeState(storedInput);
    } else {
      throw new Error('Course generation failed: State is empty and no stored input available');
    }
  }

  try {
    emitProgress({
      phase: 'strategizing',
      phaseName: 'Designing Course Structure',
      summary: 'Creating high-level course structure, learning objectives, and module breakdown...',
      progress: 10,
    });

    // Validate and normalize state before processing
    const validatedState = validateState(state);
    console.log('courseStrategistNode: State validated', {
      hasMetadata: !!validatedState.metadata,
      hasInput: !!validatedState.metadata?.input,
    });

    // Defensive check: ensure metadata exists
    // Log state structure for debugging
    if (!validatedState.metadata) {
      console.error('State received by courseStrategistNode:', {
        hasMetadata: !!validatedState.metadata,
        stateKeys: Object.keys(validatedState),
        state: JSON.stringify(validatedState, null, 2),
      });

      // Try to recover from stored input if state was lost
      const storedInput = getStoredInput();
      if (storedInput) {
        console.warn('State metadata missing, but found stored input. Reconstructing state.');
        const agent = new CourseStrategistAgent();
        const result = await agent.execute(storedInput);
        // Ensure result includes all required properties with defaults
        const defaultState = getDefaultState();
        return {
          course: result.course || defaultState.course,
          modules: Array.isArray(result.modules) ? result.modules : defaultState.modules,
          conceptGraph: result.conceptGraph || defaultState.conceptGraph,
          alignment: result.alignment || defaultState.alignment,
          metadata: {
            ...defaultState.metadata,
            ...result.metadata,
            input: storedInput, // Preserve input
          },
        };
      }

      throw new Error(
        'Course generation state is missing metadata. This should not happen. Check console for state details.'
      );
    }

    const agent = new CourseStrategistAgent();
    let input = validatedState.metadata.input;

    // Fallback: if input is missing but we have stored input, use it
    if (!input) {
      const storedInput = getStoredInput();
      if (storedInput) {
        console.warn('State metadata missing input, using stored input as fallback');
        input = storedInput;
      } else {
        console.error('State metadata missing input:', {
          metadata: validatedState.metadata,
          metadataKeys: Object.keys(validatedState.metadata || {}),
        });
        throw new Error('Course generation input is required in state metadata');
      }
    }

    console.log('courseStrategistNode: Calling agent.execute() with input:', {
      hasInput: !!input,
      topic: input?.topic,
      targetDifficulty: input?.targetDifficulty,
    });
    const result = await agent.execute(input);
    console.log('courseStrategistNode: Agent execution completed', {
      hasResult: !!result,
      hasCourse: !!result?.course,
      courseTitle: result?.course?.title,
      hasModules: !!result?.modules,
      modulesCount: Array.isArray(result?.modules) ? result.modules.length : 'not array',
    });

    // Ensure result includes all required properties
    const defaultState = getDefaultState();
    const normalizedResult: CourseGenerationStateUpdate = {
      course: result.course || defaultState.course,
      modules: Array.isArray(result.modules) ? result.modules : defaultState.modules,
      conceptGraph: result.conceptGraph || defaultState.conceptGraph,
      alignment: result.alignment || defaultState.alignment,
      metadata: {
        ...defaultState.metadata,
        ...result.metadata,
        input: input, // Preserve input in metadata
      },
    };

    console.log('courseStrategistNode: Returning normalized result', {
      hasCourse: !!normalizedResult.course,
      courseTitle: normalizedResult.course?.title,
      modulesCount: Array.isArray(normalizedResult.modules)
        ? normalizedResult.modules.length
        : 'not array',
      hasInput: !!normalizedResult.metadata?.input,
    });

    // CRITICAL: Update global state cache with the result
    // This helps recover from LangGraph serialization issues
    const fullState: CourseGenerationState = {
      course: normalizedResult.course || getDefaultState().course,
      modules: Array.isArray(normalizedResult.modules)
        ? normalizedResult.modules
        : getDefaultState().modules,
      conceptGraph: normalizedResult.conceptGraph || getDefaultState().conceptGraph,
      alignment: normalizedResult.alignment || getDefaultState().alignment,
      metadata: normalizedResult.metadata || getDefaultState().metadata,
    };
    setGlobalStateCache(fullState);

    emitProgress({
      phase: 'strategizing',
      phaseName: 'Designing Course Structure',
      summary: `Created ${normalizedResult.modules?.length || 0} modules with course objectives`,
      progress: 20,
    });

    return normalizedResult;
  } catch (error) {
    console.error('courseStrategistNode: Error during execution', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Node: Module Architect
 */
async function moduleArchitectNode(
  state: CourseGenerationState
): Promise<CourseGenerationStateUpdate> {
  // Validate and normalize state before processing
  const validatedState = validateState(state);

  // Defensive check: ensure modules exists and is an array
  if (!validatedState.modules || !Array.isArray(validatedState.modules)) {
    console.error('moduleArchitectNode: state.modules is missing or not an array!', {
      hasModules: !!validatedState.modules,
      modulesType: typeof validatedState.modules,
      modulesValue: validatedState.modules,
      stateKeys: Object.keys(validatedState),
      state: JSON.stringify(validatedState, null, 2),
    });

    // Use empty array as fallback to prevent crash
    validatedState.modules = [];
  }

  const totalModules = validatedState.modules.length;

  emitProgress({
    phase: 'architecting',
    phaseName: 'Creating Lesson Outlines',
    summary: `Designing lesson outlines for ${totalModules} modules...`,
    progress: 25,
    totalModules,
  });

  const agent = new ModuleArchitectAgent();
  const result = await agent.execute(validatedState);

  emitProgress({
    phase: 'architecting',
    phaseName: 'Creating Lesson Outlines',
    summary: `Completed lesson outlines for all modules`,
    progress: 40,
    totalModules,
  });

  // CRITICAL: Return complete state to preserve course, conceptGraph, and alignment
  // The agent returns modules and metadata, so we preserve other fields
  return {
    ...result, // modules and metadata from agent
    course: validatedState.course, // Preserve course
    conceptGraph: validatedState.conceptGraph, // Preserve conceptGraph
    alignment: validatedState.alignment, // Preserve alignment
  };
}

/**
 * Node: Concept Mapper
 */
async function conceptMapperNode(
  state: CourseGenerationState
): Promise<CourseGenerationStateUpdate> {
  // Validate and normalize state before processing
  const validatedState = validateState(state);

  // Defensive check: ensure modules exists and is an array
  if (!validatedState.modules || !Array.isArray(validatedState.modules)) {
    console.error('conceptMapperNode: state.modules is missing or not an array!', {
      hasModules: !!validatedState.modules,
      modulesType: typeof validatedState.modules,
      stateKeys: Object.keys(validatedState),
    });
    validatedState.modules = [];
  }

  const totalLessons = validatedState.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);

  emitProgress({
    phase: 'mapping',
    phaseName: 'Building Concept Graph',
    summary: `Mapping ${totalLessons} lessons and tracking concept dependencies...`,
    progress: 45,
    totalLessons,
  });

  const agent = new ConceptMapperAgent();
  const result = await agent.execute(validatedState);

  const conceptCount = result.conceptGraph?.concepts.size || 0;
  emitProgress({
    phase: 'mapping',
    phaseName: 'Building Concept Graph',
    summary: `Mapped ${conceptCount} concepts with dependencies`,
    progress: 50,
    totalLessons,
  });

  // CRITICAL: Return complete state to preserve modules, course, and alignment
  // The agent returns conceptGraph and metadata, so we preserve other fields
  return {
    ...result, // conceptGraph and metadata from agent
    modules: validatedState.modules, // Preserve modules
    course: validatedState.course, // Preserve course
    alignment: validatedState.alignment, // Preserve alignment
  };
}

/**
 * Node: Flow Validator
 */
async function flowValidatorNode(
  state: CourseGenerationState
): Promise<CourseGenerationStateUpdate> {
  console.log('flowValidatorNode: Starting execution', {
    hasState: !!state,
    hasModules: !!state?.modules,
    modulesCount: Array.isArray(state?.modules) ? state.modules.length : 'not array',
    stateKeys: state ? Object.keys(state) : [],
  });

  // CRITICAL: Detect if state is empty/corrupted (LangGraph serialization issue)
  if (state && Object.keys(state).length === 0) {
    console.error(
      'flowValidatorNode: Received empty state object! Attempting recovery from global cache...'
    );
    // Try to recover from global state cache
    const cachedState = getGlobalStateCache();
    if (cachedState && Object.keys(cachedState).length > 0) {
      console.log('flowValidatorNode: Recovered state from global cache', {
        hasModules: !!cachedState.modules,
        modulesCount: Array.isArray(cachedState.modules) ? cachedState.modules.length : 'not array',
      });
      state = cachedState;
    } else {
      throw new Error(
        'Course generation failed: State was lost during graph execution and cache is empty. This is a critical error.'
      );
    }
  }

  try {
    // Validate and normalize state before processing
    const validatedState = validateState(state);

    // Defensive check: ensure modules exists and is an array
    if (!Array.isArray(validatedState.modules)) {
      console.error('flowValidatorNode: state.modules is missing or not an array!', {
        hasModules: !!validatedState.modules,
        modulesType: typeof validatedState.modules,
        stateKeys: Object.keys(validatedState),
      });
      validatedState.modules = [];
    }

    emitProgress({
      phase: 'validating',
      phaseName: 'Validating Course Flow',
      summary: 'Checking lesson transitions, identifying gaps and redundancies...',
      progress: 55,
    });

    const agent = new FlowValidatorAgent();
    console.log('flowValidatorNode: Calling agent.execute()');
    const result = await agent.execute(validatedState);
    console.log('flowValidatorNode: Agent execution completed', {
      hasResult: !!result,
      hasAlignment: !!result?.alignment,
      overallScore: result?.alignment?.overallScore,
      issuesCount: result?.alignment?.issues?.length || 0,
    });

    const score = result.alignment?.overallScore || 0;
    const issues = result.alignment?.issues.length || 0;
    emitProgress({
      phase: 'validating',
      phaseName: 'Validating Course Flow',
      summary: `Alignment score: ${Math.round(score * 100)}%${issues > 0 ? `, ${issues} issues found` : ''}`,
      progress: 60,
    });

    console.log('flowValidatorNode: Returning result', {
      hasAlignment: !!result.alignment,
      overallScore: result.alignment?.overallScore,
    });

    // CRITICAL: Return complete state to preserve modules, course, and conceptGraph
    // The agent only returns alignment and metadata, so we must preserve other fields
    return {
      ...result, // alignment and metadata from agent
      modules: validatedState.modules, // Preserve modules
      course: validatedState.course, // Preserve course
      conceptGraph: validatedState.conceptGraph, // Preserve conceptGraph
    };
  } catch (error) {
    console.error('flowValidatorNode: Error during execution', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Node: Refinement Agent
 */
async function refinementAgentNode(
  state: CourseGenerationState
): Promise<CourseGenerationStateUpdate> {
  console.log('refinementAgentNode: Starting execution', {
    hasState: !!state,
    hasAlignment: !!state?.alignment,
    overallScore: state?.alignment?.overallScore,
    iterations: state?.metadata?.iterations,
    stateKeys: state ? Object.keys(state) : [],
  });

  // CRITICAL: Detect if state is empty/corrupted (LangGraph serialization issue)
  if (state && Object.keys(state).length === 0) {
    console.error(
      'refinementAgentNode: Received empty state object! Attempting recovery from global cache...'
    );
    // Try to recover from global state cache
    const cachedState = getGlobalStateCache();
    if (cachedState && Object.keys(cachedState).length > 0) {
      console.log('refinementAgentNode: Recovered state from global cache', {
        hasModules: !!cachedState.modules,
        modulesCount: Array.isArray(cachedState.modules) ? cachedState.modules.length : 'not array',
      });
      state = cachedState;
    } else {
      throw new Error(
        'Course generation failed: State was lost during graph execution and cache is empty.'
      );
    }
  }

  try {
    // Validate and normalize state before processing
    const validatedState = validateState(state);

    // Defensive check: ensure modules exists and is an array
    if (!Array.isArray(validatedState.modules)) {
      console.error('refinementAgentNode: state.modules is missing or not an array!', {
        hasModules: !!validatedState.modules,
        modulesType: typeof validatedState.modules,
        stateKeys: Object.keys(validatedState),
      });
      validatedState.modules = [];
    }

    emitProgress({
      phase: 'refining',
      phaseName: 'Refining Course Structure',
      summary: `Iteration ${validatedState.metadata.iterations + 1}: Fixing alignment issues...`,
      progress: 65,
    });

    const agent = new RefinementAgent();
    console.log('refinementAgentNode: Calling agent.execute()');
    const result = await agent.execute(validatedState);
    console.log('refinementAgentNode: Agent execution completed', {
      hasResult: !!result,
      hasModules: !!result?.modules,
      modulesCount: Array.isArray(result?.modules) ? result.modules.length : 'not array',
      resultIterations: result?.metadata?.iterations,
    });

    // CRITICAL: Ensure iterations are explicitly set in the result
    // This prevents loss during state merging
    const currentIterations =
      result.metadata?.iterations !== undefined
        ? result.metadata.iterations
        : (validatedState.metadata.iterations || 0) + 1;

    // Update global counter as backup
    globalIterationCounter = Math.max(globalIterationCounter, currentIterations);

    const resultWithIterations: CourseGenerationStateUpdate = {
      ...result, // modules and metadata from agent
      course: validatedState.course, // Preserve course
      conceptGraph: validatedState.conceptGraph, // Preserve conceptGraph
      alignment: validatedState.alignment, // Preserve alignment (will be re-validated)
      metadata: {
        ...(result.metadata || {}),
        iterations: currentIterations,
        currentPhase: (result.metadata?.currentPhase || 'validating') as 'validating',
        lastModified: result.metadata?.lastModified || new Date().toISOString(),
      },
    };

    console.log(
      `refinementAgentNode: Returning with iterations=${currentIterations}, global=${globalIterationCounter}`,
      {
        hasModules: !!resultWithIterations.modules,
        modulesCount: Array.isArray(resultWithIterations.modules)
          ? resultWithIterations.modules.length
          : 'not array',
      }
    );

    emitProgress({
      phase: 'refining',
      phaseName: 'Refining Course Structure',
      summary: `Refinements applied, re-validating...`,
      progress: 70,
    });

    return resultWithIterations;
  } catch (error) {
    console.error('refinementAgentNode: Error during execution', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Node: Content Generator
 */
async function contentGeneratorNode(
  state: CourseGenerationState
): Promise<CourseGenerationStateUpdate> {
  console.log('contentGeneratorNode: Starting execution', {
    hasState: !!state,
    stateKeys: state ? Object.keys(state) : [],
    hasModules: !!state?.modules,
    modulesCount: Array.isArray(state?.modules) ? state.modules.length : 'not array',
  });

  // CRITICAL: Detect if state is empty/corrupted (LangGraph serialization issue)
  if (state && Object.keys(state).length === 0) {
    console.error(
      'contentGeneratorNode: Received empty state object! Attempting recovery from global cache...'
    );
    // Try to recover from global state cache
    const cachedState = getGlobalStateCache();
    if (cachedState && Object.keys(cachedState).length > 0) {
      console.log('contentGeneratorNode: Recovered state from global cache', {
        hasModules: !!cachedState.modules,
        modulesCount: Array.isArray(cachedState.modules) ? cachedState.modules.length : 'not array',
      });
      state = cachedState;
    } else {
      throw new Error(
        'Course generation failed: State was lost during graph execution and cache is empty.'
      );
    }
  }

  try {
    // Validate and normalize state before processing
    const validatedState = validateState(state);
    console.log('contentGeneratorNode: State validated', {
      modulesCount: Array.isArray(validatedState.modules)
        ? validatedState.modules.length
        : 'not array',
      hasCourse: !!validatedState.course,
      courseTitle: validatedState.course?.title,
    });

    // Defensive check: ensure modules exists and is an array
    if (!validatedState.modules || !Array.isArray(validatedState.modules)) {
      console.error('contentGeneratorNode: state.modules is missing or not an array!', {
        hasModules: !!validatedState.modules,
        modulesType: typeof validatedState.modules,
        stateKeys: Object.keys(validatedState),
      });
      validatedState.modules = [];
    }

    const totalLessons = validatedState.modules.reduce(
      (sum, m) => sum + (m.lessons?.length || 0),
      0
    );
    console.log('contentGeneratorNode: Total lessons to process:', totalLessons);

    emitProgress({
      phase: 'generating',
      phaseName: 'Generating Lesson Content',
      summary: `Generating detailed content for ${totalLessons} lessons...`,
      progress: 75,
      totalLessons,
    });

    const agent = new ContentGeneratorAgent();
    console.log('contentGeneratorNode: Calling agent.execute()');
    const result = await agent.execute(validatedState);
    console.log('contentGeneratorNode: Agent execution completed', {
      hasResult: !!result,
      resultType: typeof result,
      resultKeys: result ? Object.keys(result) : [],
      hasModules: !!result?.modules,
      modulesCount: Array.isArray(result?.modules) ? result.modules.length : 'not array',
    });

    // Ensure result is a valid state update
    if (!result || typeof result !== 'object') {
      console.error('contentGeneratorNode: agent returned invalid result:', {
        result,
        resultType: typeof result,
        isNull: result === null,
        isUndefined: result === undefined,
      });
      throw new Error('Content generator returned invalid state update');
    }

    // Ensure result has at least modules (even if empty)
    if (!result.modules) {
      console.warn('contentGeneratorNode: result missing modules, using validated state modules');
      result.modules = validatedState.modules;
    }

    // Ensure result has metadata
    if (!result.metadata) {
      console.warn('contentGeneratorNode: result missing metadata, adding from validated state');
      result.metadata = {
        ...validatedState.metadata,
        currentPhase: 'generating',
        lastModified: new Date().toISOString(),
      };
    }

    emitProgress({
      phase: 'generating',
      phaseName: 'Generating Lesson Content',
      summary: `Completed content generation for all lessons`,
      progress: 100,
      totalLessons,
    });

    console.log('contentGeneratorNode: Returning result', {
      hasModules: !!result.modules,
      modulesCount: Array.isArray(result.modules) ? result.modules.length : 'not array',
      hasMetadata: !!result.metadata,
    });

    // CRITICAL: Return complete state to preserve course, conceptGraph, and alignment
    // The agent returns modules and metadata, so we preserve other fields
    return {
      ...result, // modules and metadata from agent
      course: validatedState.course, // Preserve course
      conceptGraph: validatedState.conceptGraph, // Preserve conceptGraph
      alignment: validatedState.alignment, // Preserve alignment
    };
  } catch (error) {
    console.error('contentGeneratorNode: Error during execution', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      stateKeys: state ? Object.keys(state) : [],
    });
    throw error;
  }
}

/**
 * Build the course generation graph
 */
export function buildCourseGenerationGraph() {
  const workflow = new StateGraph(CourseGenerationAnnotation);

  workflow.addNode('course_strategist', courseStrategistNode);
  workflow.addNode('module_architect', moduleArchitectNode);
  workflow.addNode('concept_mapper', conceptMapperNode);
  workflow.addNode('flow_validator', flowValidatorNode);
  workflow.addNode('refinement_agent', refinementAgentNode);
  workflow.addNode('content_generator', contentGeneratorNode);

  workflow.addEdge(START, 'course_strategist');
  workflow.addEdge('course_strategist', 'module_architect');
  workflow.addEdge('module_architect', 'concept_mapper');
  workflow.addEdge('concept_mapper', 'flow_validator');

  // Conditional edge for refinement loop
  workflow.addConditionalEdges('flow_validator', shouldRefine, {
    refine: 'refinement_agent',
    generate_content: 'content_generator',
  });

  workflow.addEdge('refinement_agent', 'flow_validator');
  workflow.addEdge('content_generator', END);

  return workflow.compile();
}

/**
 * Initialize initial state from input
 */
export function initializeState(input: CourseGenerationInput): CourseGenerationState {
  return {
    course: {
      title: '',
      description: '',
      difficulty: input.targetDifficulty,
      estimatedHours: 0,
      learningObjectives: [],
      prerequisites: [],
    },
    modules: [],
    conceptGraph: {
      concepts: new Map(),
      dependencies: [],
    },
    alignment: {
      lessonTransitions: [],
      overallScore: 0,
      issues: [],
    },
    metadata: {
      currentPhase: 'strategizing',
      iterations: 0,
      lastModified: new Date().toISOString(),
      input, // Store input for first node
    },
  };
}
