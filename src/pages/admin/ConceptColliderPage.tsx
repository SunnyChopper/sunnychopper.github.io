import { useState, useEffect } from 'react';
import { Sparkles, Plus, Search, Trash2, Info, RefreshCw } from 'lucide-react';
import ForceDirectedGraph from '../../components/organisms/ForceDirectedGraph';
import ConceptSynthesisModal from '../../components/organisms/ConceptSynthesisModal';
import { conceptGraphService } from '../../services/knowledge-vault/concept-graph.service';
import { conceptSynthesisService } from '../../services/knowledge-vault/concept-synthesis.service';
import type {
  ConceptNode,
  ConceptEdge,
  ConceptSynthesis,
  CreateConceptNodeInput,
} from '../../types/concept-graph';
import type { Area } from '../../types/growth-system';
import { AREAS } from '../../constants/growth-system';

export default function ConceptColliderPage() {
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [edges, setEdges] = useState<ConceptEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);
  const [secondSelectedNode, setSecondSelectedNode] = useState<ConceptNode | null>(null);
  const [showSynthesisModal, setShowSynthesisModal] = useState(false);
  const [synthesis, setSynthesis] = useState<ConceptSynthesis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddNodeForm, setShowAddNodeForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNodeForm, setNewNodeForm] = useState<CreateConceptNodeInput>({
    label: '',
    description: '',
    area: 'Operations',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = () => {
    conceptGraphService.seedSampleData();
    const graph = conceptGraphService.getGraph();
    setNodes(graph.nodes);
    setEdges(graph.edges);
  };

  const handleNodeClick = (node: ConceptNode) => {
    if (!selectedNode) {
      setSelectedNode(node);
      conceptGraphService.incrementNodeAccess(node.id);
    } else if (selectedNode.id === node.id) {
      setSelectedNode(null);
    } else {
      setSecondSelectedNode(node);
      setSynthesis(null);
      setShowSynthesisModal(true);
      conceptGraphService.incrementNodeAccess(node.id);
    }
  };

  const handleCanvasClick = () => {
    setSelectedNode(null);
    setSecondSelectedNode(null);
  };

  const handleGenerateSynthesis = async () => {
    if (!selectedNode || !secondSelectedNode) return;

    setIsGenerating(true);
    try {
      const result = await conceptSynthesisService.generateSynthesis(
        selectedNode,
        secondSelectedNode
      );
      setSynthesis(result);
    } catch (error) {
      console.error('Failed to generate synthesis:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveConnection = (connectionStrength: number) => {
    if (!selectedNode || !secondSelectedNode || !synthesis) return;

    const edge = conceptGraphService.createEdge({
      source: selectedNode.id,
      target: secondSelectedNode.id,
      synthesisInsight: synthesis.synthesis,
      connectionStrength,
    });

    if (edge) {
      setEdges([...edges, edge]);
      setShowSynthesisModal(false);
      setSelectedNode(null);
      setSecondSelectedNode(null);
      setSynthesis(null);
    }
  };

  const handleAddNode = () => {
    if (!newNodeForm.label.trim()) return;

    const node = conceptGraphService.createNode(newNodeForm);
    setNodes([...nodes, node]);
    setShowAddNodeForm(false);
    setNewNodeForm({
      label: '',
      description: '',
      area: 'Operations',
      tags: [],
    });
    setTagInput('');
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;

    const success = conceptGraphService.deleteNode(selectedNode.id);
    if (success) {
      loadGraph();
      setSelectedNode(null);
    }
  };

  const handleAddTag = () => {
    const tags = newNodeForm.tags || [];
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setNewNodeForm({
        ...newNodeForm,
        tags: [...tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewNodeForm({
      ...newNodeForm,
      tags: (newNodeForm.tags || []).filter((t) => t !== tag),
    });
  };

  const filteredNodes = searchQuery.trim() ? conceptGraphService.searchNodes(searchQuery) : nodes;

  const connectedNodes = selectedNode ? conceptGraphService.getConnectedNodes(selectedNode.id) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
          <Sparkles size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Concept Collider</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Explore connections in your knowledge graph
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Knowledge Graph
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddNodeForm(!showAddNodeForm)}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                >
                  <Plus size={16} />
                  <span>Add Concept</span>
                </button>
                <button
                  onClick={loadGraph}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  title="Refresh graph"
                >
                  <RefreshCw size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {showAddNodeForm && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Add New Concept
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Concept Name
                    </label>
                    <input
                      type="text"
                      value={newNodeForm.label}
                      onChange={(e) => setNewNodeForm({ ...newNodeForm, label: e.target.value })}
                      placeholder="e.g., Systems Thinking"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      value={newNodeForm.description}
                      onChange={(e) =>
                        setNewNodeForm({ ...newNodeForm, description: e.target.value })
                      }
                      placeholder="Brief description..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Area
                    </label>
                    <select
                      value={newNodeForm.area}
                      onChange={(e) =>
                        setNewNodeForm({ ...newNodeForm, area: e.target.value as Area })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      {AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === 'Enter' && (handleAddTag(), e.preventDefault())
                        }
                        placeholder="Add tag..."
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition"
                      >
                        Add
                      </button>
                    </div>
                    {newNodeForm.tags && newNodeForm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newNodeForm.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-purple-900 dark:hover:text-purple-100"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddNode}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                    >
                      Create Concept
                    </button>
                    <button
                      onClick={() => setShowAddNodeForm(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center">
              <ForceDirectedGraph
                nodes={filteredNodes}
                edges={edges}
                selectedNodeId={selectedNode?.id}
                onNodeClick={handleNodeClick}
                onCanvasClick={handleCanvasClick}
                width={900}
                height={600}
              />
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">How to use:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Click a concept to select it</li>
                    <li>Click another concept to synthesize and create a connection</li>
                    <li>Drag concepts to rearrange the graph</li>
                    <li>Click empty space to deselect</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Search Concepts
            </h3>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {selectedNode && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Selected Concept
                </h3>
                <button
                  onClick={handleDeleteNode}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition"
                  title="Delete concept"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedNode.label}
                  </p>
                </div>
                {selectedNode.description && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedNode.description}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Area</p>
                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                    {selectedNode.area}
                  </span>
                </div>
                {selectedNode.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Connections</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {connectedNodes.length} connected concepts
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Graph Stats
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Concepts</span>
                <span className="font-medium text-gray-900 dark:text-white">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Connections</span>
                <span className="font-medium text-gray-900 dark:text-white">{edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Density</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {nodes.length > 0
                    ? ((edges.length / ((nodes.length * (nodes.length - 1)) / 2)) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedNode && secondSelectedNode && (
        <ConceptSynthesisModal
          isOpen={showSynthesisModal}
          onClose={() => {
            setShowSynthesisModal(false);
            setSecondSelectedNode(null);
            setSynthesis(null);
          }}
          node1={selectedNode}
          node2={secondSelectedNode}
          synthesis={synthesis}
          isGenerating={isGenerating}
          onGenerate={handleGenerateSynthesis}
          onSave={handleSaveConnection}
        />
      )}
    </div>
  );
}
