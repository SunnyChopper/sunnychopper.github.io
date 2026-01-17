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

// Helper functions to reduce reducer complexity
function handleInitialState(y: CourseGenerationStateUpdate): CourseGenerationState | null {
  const yKeys = Object.keys(y);
  const hasStateProperties =
    yKeys.length > 0 &&
    ('metadata' in y || 'course' in y || 'modules' in y || 'conceptGraph' in y || 'alignment' in y);

  if (!hasStateProperties) {
    return null;
  }

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
                ? new Map(Object.entries(y.conceptGraph.concepts as Record<string, ConceptNode>))
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

  if (y.metadata?.input) {
    initialState.metadata.input = y.metadata.input;
  }

  if (typeof y.metadata?.iterations === 'number') {
    initialState.metadata.iterations = y.metadata.iterations;
  }

  return initialState;
}

function recoverPrevState(x: CourseGenerationState | undefined): CourseGenerationState {
  let prevState = x ?? getDefaultState();

  if (prevState && Object.keys(prevState).length === 0) {
    const cachedState = getGlobalStateCache();
    if (cachedState && Object.keys(cachedState).length > 0) {
      prevState = cachedState;
    } else {
      prevState = getDefaultState();
    }
  }

  if (prevState && !Array.isArray(prevState.modules)) {
    const defaultState = getDefaultState();
    prevState = {
      ...defaultState,
      ...prevState,
      modules: Array.isArray(prevState.modules) ? prevState.modules : defaultState.modules,
    };
  }

  if (!prevState.metadata) {
    prevState = {
      ...prevState,
      metadata: getDefaultState().metadata,
    };
  }

  return prevState;
}

function mergeMetadata(
  prevMetadata: CourseGenerationState['metadata'],
  yMetadata?: CourseGenerationStateUpdate['metadata']
): CourseGenerationState['metadata'] {
  const prevIterations = typeof prevMetadata.iterations === 'number' ? prevMetadata.iterations : 0;
  const newIterations =
    typeof yMetadata?.iterations === 'number' ? yMetadata.iterations : undefined;
  const finalIterations =
    newIterations !== undefined ? Math.max(newIterations, prevIterations) : prevIterations;

  return {
    ...prevMetadata,
    ...(yMetadata || {}),
    input: yMetadata?.input !== undefined ? yMetadata.input : prevMetadata.input,
    currentPhase: yMetadata?.currentPhase ?? prevMetadata.currentPhase,
    iterations: finalIterations,
    lastModified: yMetadata?.lastModified ?? prevMetadata.lastModified,
  };
}

function mergeModules(
  prevModules: CourseGenerationState['modules'],
  yModules?: CourseGenerationStateUpdate['modules']
): CourseGenerationState['modules'] {
  if (Array.isArray(yModules)) {
    return yModules;
  }
  if (Array.isArray(prevModules)) {
    return prevModules;
  }
  return [];
}

function mergeConceptGraph(
  prevConceptGraph: CourseGenerationState['conceptGraph'],
  yConceptGraph?: CourseGenerationStateUpdate['conceptGraph']
): CourseGenerationState['conceptGraph'] {
  if (!yConceptGraph) {
    return prevConceptGraph;
  }

  let concepts: Map<string, ConceptNode>;
  if (yConceptGraph.concepts instanceof Map) {
    concepts = yConceptGraph.concepts;
  } else if (yConceptGraph.concepts && typeof yConceptGraph.concepts === 'object') {
    concepts = new Map(Object.entries(yConceptGraph.concepts as Record<string, ConceptNode>));
  } else {
    concepts = prevConceptGraph.concepts;
  }

  return {
    concepts: concepts.size > 0 ? concepts : prevConceptGraph.concepts,
    dependencies:
      yConceptGraph.dependencies?.length > 0
        ? yConceptGraph.dependencies
        : prevConceptGraph.dependencies,
  };
}

function mergeAlignment(
  prevAlignment: CourseGenerationState['alignment'],
  yAlignment?: CourseGenerationStateUpdate['alignment']
): CourseGenerationState['alignment'] {
  if (!yAlignment) {
    return prevAlignment;
  }

  return {
    ...prevAlignment,
    ...yAlignment,
    lessonTransitions: yAlignment.lessonTransitions ?? prevAlignment.lessonTransitions,
    issues: yAlignment.issues ?? prevAlignment.issues,
  };
}

function finalizeState(mergedState: CourseGenerationState): CourseGenerationState {
  if (!Array.isArray(mergedState.modules)) {
    const prevState = getGlobalStateCache();
    if (prevState && Array.isArray(prevState.modules)) {
      mergedState.modules = prevState.modules;
    } else {
      mergedState.modules = [];
    }
  }

  const defaultAlignment = getDefaultState().alignment;
  if (!mergedState.alignment || typeof mergedState.alignment !== 'object') {
    mergedState.alignment = defaultAlignment;
  } else {
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

  return validateState(mergedState);
}

const CourseGenerationAnnotation = Annotation.Root({
  course: Annotation<CourseGenerationState['course']>({
    reducer: (x, y) =>
      y ? { ...(x || getDefaultState().course), ...y } : x || getDefaultState().course,
    default: () => getDefaultState().course,
  }),
  modules: Annotation<CourseGenerationState['modules']>({
    reducer: (x, y) => mergeModules(x || getDefaultState().modules, y),
    default: () => getDefaultState().modules,
  }),
  conceptGraph: Annotation<CourseGenerationState['conceptGraph']>({
    reducer: (x, y) => mergeConceptGraph(x || getDefaultState().conceptGraph, y),
    default: () => getDefaultState().conceptGraph,
  }),
  alignment: Annotation<CourseGenerationState['alignment']>({
    reducer: (x, y) => mergeAlignment(x || getDefaultState().alignment, y),
    default: () => getDefaultState().alignment,
  }),
  metadata: Annotation<CourseGenerationState['metadata']>({
    reducer: (x, y) => mergeMetadata(x || getDefaultState().metadata, y),
    default: () => getDefaultState().metadata,
  }),
});

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

// Helper functions for courseStrategistNode
function recoverStateFromInput(): CourseGenerationState {
  const storedInput = getStoredInput();
  if (storedInput) {
    return initializeState(storedInput);
  }
  throw new Error('Course generation failed: State is empty and no stored input available');
}

async function handleMissingMetadata(
  validatedState: CourseGenerationState
): Promise<CourseGenerationStateUpdate | null> {
  const storedInput = getStoredInput();
  if (!storedInput) {
    return null;
  }

  const agent = new CourseStrategistAgent();
  const result = await agent.execute(storedInput);
  const defaultState = getDefaultState();
  return {
    course: result.course || defaultState.course,
    modules: Array.isArray(result.modules) ? result.modules : defaultState.modules,
    conceptGraph: result.conceptGraph || defaultState.conceptGraph,
    alignment: result.alignment || defaultState.alignment,
    metadata: {
      ...defaultState.metadata,
      ...result.metadata,
      input: storedInput,
    },
  };
}

function getInputWithFallback(validatedState: CourseGenerationState): CourseGenerationInput {
  if (validatedState.metadata.input) {
    return validatedState.metadata.input;
  }

  const storedInput = getStoredInput();
  if (storedInput) {
    return storedInput;
  }

  throw new Error('Course generation input is required in state metadata');
}

function normalizeStrategistResult(
  result: CourseGenerationStateUpdate,
  input: CourseGenerationInput
): CourseGenerationStateUpdate {
  const defaultState = getDefaultState();
  return {
    course: result.course || defaultState.course,
    modules: Array.isArray(result.modules) ? result.modules : defaultState.modules,
    conceptGraph: result.conceptGraph || defaultState.conceptGraph,
    alignment: result.alignment || defaultState.alignment,
    metadata: {
      ...defaultState.metadata,
      ...result.metadata,
      input,
    },
  };
}

/**
 * Node: Course Strategist
 */
async function courseStrategistNode(
  state: CourseGenerationState
): Promise<CourseGenerationStateUpdate> {
  // Recover from empty state
  if (state && Object.keys(state).length === 0) {
    state = recoverStateFromInput();
  }

  try {
    emitProgress({
      phase: 'strategizing',
      phaseName: 'Designing Course Structure',
      summary: 'Creating high-level course structure, learning objectives, and module breakdown...',
      progress: 10,
    });

    const validatedState = validateState(state);

    // Handle missing metadata
    if (!validatedState.metadata) {
      const recoveredResult = await handleMissingMetadata(validatedState);
      if (recoveredResult) {
        return recoveredResult;
      }
      throw new Error(
        'Course generation state is missing metadata. This should not happen. Check console for state details.'
      );
    }

    const input = getInputWithFallback(validatedState);
    const agent = new CourseStrategistAgent();
    const result = await agent.execute(input);
    const normalizedResult = normalizeStrategistResult(result, input);

    // Update global cache
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

// Helper functions for contentGeneratorNode
function recoverContentGeneratorState(): CourseGenerationState {
  const cachedState = getGlobalStateCache();
  if (cachedState && Object.keys(cachedState).length > 0) {
    return cachedState;
  }
  throw new Error(
    'Course generation failed: State was lost during graph execution and cache is empty.'
  );
}

function validateContentGeneratorState(state: CourseGenerationState): CourseGenerationState {
  const validatedState = validateState(state);
  if (!validatedState.modules || !Array.isArray(validatedState.modules)) {
    validatedState.modules = [];
  }
  return validatedState;
}

function ensureResultValidity(
  result: CourseGenerationStateUpdate | null | undefined,
  validatedState: CourseGenerationState
): CourseGenerationStateUpdate {
  if (!result || typeof result !== 'object') {
    throw new Error('Content generator returned invalid state update');
  }

  if (!result.modules) {
    result.modules = validatedState.modules;
  }

  if (!result.metadata) {
    result.metadata = {
      ...validatedState.metadata,
      currentPhase: 'generating',
      lastModified: new Date().toISOString(),
    };
  }

  return result;
}

/**
 * Node: Content Generator
 */
async function contentGeneratorNode(
  state: CourseGenerationState
): Promise<CourseGenerationStateUpdate> {
  // Recover from empty state
  if (state && Object.keys(state).length === 0) {
    state = recoverContentGeneratorState();
  }

  try {
    const validatedState = validateContentGeneratorState(state);
    const totalLessons = validatedState.modules.reduce(
      (sum, m) => sum + (m.lessons?.length || 0),
      0
    );

    emitProgress({
      phase: 'generating',
      phaseName: 'Generating Lesson Content',
      summary: `Generating detailed content for ${totalLessons} lessons...`,
      progress: 75,
      totalLessons,
    });

    const agent = new ContentGeneratorAgent();
    const result = await agent.execute(validatedState);
    const validResult = ensureResultValidity(result, validatedState);

    emitProgress({
      phase: 'generating',
      phaseName: 'Generating Lesson Content',
      summary: `Completed content generation for all lessons`,
      progress: 100,
      totalLessons,
    });

    return {
      ...validResult,
      course: validatedState.course,
      conceptGraph: validatedState.conceptGraph,
      alignment: validatedState.alignment,
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
