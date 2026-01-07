import type {
  ConceptNode,
  ConceptEdge,
  ConceptGraph,
  CreateConceptNodeInput,
  UpdateConceptNodeInput,
  CreateConceptEdgeInput,
} from '../../types/concept-graph';

const STORAGE_KEY_NODES = 'kv_concept_nodes';
const STORAGE_KEY_EDGES = 'kv_concept_edges';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const conceptGraphService = {
  getGraph(): ConceptGraph {
    const nodes = this.getAllNodes();
    const edges = this.getAllEdges();
    return { nodes, edges };
  },

  getAllNodes(): ConceptNode[] {
    const data = localStorage.getItem(STORAGE_KEY_NODES);
    return data ? JSON.parse(data) : [];
  },

  getAllEdges(): ConceptEdge[] {
    const data = localStorage.getItem(STORAGE_KEY_EDGES);
    return data ? JSON.parse(data) : [];
  },

  getNodeById(id: string): ConceptNode | null {
    const nodes = this.getAllNodes();
    return nodes.find(node => node.id === id) || null;
  },

  getNodesByArea(area: string): ConceptNode[] {
    const nodes = this.getAllNodes();
    return nodes.filter(node => node.area === area);
  },

  getConnectedNodes(nodeId: string): ConceptNode[] {
    const edges = this.getAllEdges();
    const connectedIds = new Set<string>();

    edges.forEach(edge => {
      if (edge.source === nodeId) connectedIds.add(edge.target);
      if (edge.target === nodeId) connectedIds.add(edge.source);
    });

    const nodes = this.getAllNodes();
    return nodes.filter(node => connectedIds.has(node.id));
  },

  getNodeConnections(nodeId: string): ConceptEdge[] {
    const edges = this.getAllEdges();
    return edges.filter(edge => edge.source === nodeId || edge.target === nodeId);
  },

  createNode(input: CreateConceptNodeInput): ConceptNode {
    const nodes = this.getAllNodes();
    const now = new Date().toISOString();

    const newNode: ConceptNode = {
      id: generateId(),
      label: input.label,
      description: input.description,
      area: input.area,
      tags: input.tags || [],
      createdAt: now,
      updatedAt: now,
      accessCount: 0,
    };

    nodes.push(newNode);
    localStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(nodes));

    return newNode;
  },

  updateNode(id: string, input: UpdateConceptNodeInput): ConceptNode | null {
    const nodes = this.getAllNodes();
    const index = nodes.findIndex(node => node.id === id);

    if (index === -1) return null;

    const updatedNode: ConceptNode = {
      ...nodes[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    nodes[index] = updatedNode;
    localStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(nodes));

    return updatedNode;
  },

  deleteNode(id: string): boolean {
    let nodes = this.getAllNodes();
    const initialLength = nodes.length;
    nodes = nodes.filter(node => node.id !== id);

    if (nodes.length === initialLength) return false;

    localStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(nodes));

    let edges = this.getAllEdges();
    edges = edges.filter(edge => edge.source !== id && edge.target !== id);
    localStorage.setItem(STORAGE_KEY_EDGES, JSON.stringify(edges));

    return true;
  },

  incrementNodeAccess(id: string): void {
    const nodes = this.getAllNodes();
    const index = nodes.findIndex(node => node.id === id);

    if (index !== -1) {
      nodes[index].accessCount += 1;
      nodes[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(nodes));
    }
  },

  createEdge(input: CreateConceptEdgeInput): ConceptEdge | null {
    const sourceNode = this.getNodeById(input.source);
    const targetNode = this.getNodeById(input.target);

    if (!sourceNode || !targetNode) return null;

    const edges = this.getAllEdges();

    const existingEdge = edges.find(
      edge =>
        (edge.source === input.source && edge.target === input.target) ||
        (edge.source === input.target && edge.target === input.source)
    );

    if (existingEdge) return null;

    const newEdge: ConceptEdge = {
      id: generateId(),
      source: input.source,
      target: input.target,
      synthesisInsight: input.synthesisInsight,
      connectionStrength: input.connectionStrength,
      createdAt: new Date().toISOString(),
    };

    edges.push(newEdge);
    localStorage.setItem(STORAGE_KEY_EDGES, JSON.stringify(edges));

    return newEdge;
  },

  deleteEdge(id: string): boolean {
    let edges = this.getAllEdges();
    const initialLength = edges.length;
    edges = edges.filter(edge => edge.id !== id);

    if (edges.length === initialLength) return false;

    localStorage.setItem(STORAGE_KEY_EDGES, JSON.stringify(edges));
    return true;
  },

  searchNodes(query: string): ConceptNode[] {
    const nodes = this.getAllNodes();
    const lowerQuery = query.toLowerCase();

    return nodes.filter(node =>
      node.label.toLowerCase().includes(lowerQuery) ||
      node.description?.toLowerCase().includes(lowerQuery) ||
      node.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  seedSampleData(): void {
    const existingNodes = this.getAllNodes();
    if (existingNodes.length > 0) return;

    const sampleNodes: CreateConceptNodeInput[] = [
      { label: 'Systems Thinking', area: 'Operations', tags: ['mental-models', 'frameworks'] },
      { label: 'Habit Formation', area: 'Health', tags: ['behavior', 'psychology'] },
      { label: 'Compound Interest', area: 'Wealth', tags: ['finance', 'investing'] },
      { label: 'Growth Mindset', area: 'Happiness', tags: ['psychology', 'mindset'] },
      { label: 'Network Effects', area: 'Wealth', tags: ['business', 'scaling'] },
      { label: 'Neuroplasticity', area: 'Health', tags: ['brain', 'learning'] },
      { label: 'Feedback Loops', area: 'Operations', tags: ['systems', 'improvement'] },
      { label: 'Social Capital', area: 'Love', tags: ['relationships', 'networking'] },
    ];

    sampleNodes.forEach(input => this.createNode(input));
  },
};
