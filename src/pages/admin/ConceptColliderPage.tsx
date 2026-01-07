import { useState } from 'react';
import { Sparkles, Zap, Brain, ArrowRight, RefreshCw } from 'lucide-react';

export default function ConceptColliderPage() {
  const [concept1, setConcept1] = useState('');
  const [concept2, setConcept2] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    synthesis: string;
    insights: string[];
    applications: string[];
  } | null>(null);

  const handleCollide = async () => {
    if (!concept1.trim() || !concept2.trim()) return;

    setIsGenerating(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setResult({
      synthesis: `Combining "${concept1}" with "${concept2}" creates a powerful framework for understanding complex systems. This intersection reveals new patterns and opportunities for innovation.`,
      insights: [
        `The principles of ${concept1} can be applied to enhance ${concept2} through systematic analysis`,
        `Both concepts share underlying patterns related to emergence and self-organization`,
        `This synthesis enables a multi-dimensional approach to problem-solving`,
      ],
      applications: [
        `Use ${concept1} frameworks to optimize ${concept2} implementations`,
        `Create hybrid models that leverage strengths of both approaches`,
        `Develop new mental models for understanding complex phenomena`,
      ],
    });

    setIsGenerating(false);
  };

  const handleReset = () => {
    setConcept1('');
    setConcept2('');
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
          <Sparkles size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Concept Collider
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Merge two concepts to discover novel insights and connections
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Concept 1
              </label>
              <input
                type="text"
                value={concept1}
                onChange={(e) => setConcept1(e.target.value)}
                placeholder="e.g., Systems Thinking"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Zap size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Concept 2
              </label>
              <input
                type="text"
                value={concept2}
                onChange={(e) => setConcept2(e.target.value)}
                placeholder="e.g., Habit Formation"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCollide}
              disabled={!concept1.trim() || !concept2.trim() || isGenerating}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  <span>Colliding...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Collide Concepts</span>
                </>
              )}
            </button>

            {result && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
              >
                <RefreshCw size={20} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={24} className="text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Synthesis
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {result.synthesis}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Key Insights
                </h3>
              </div>
              <ul className="space-y-3">
                {result.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <ArrowRight size={20} className="text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={20} className="text-pink-600 dark:text-pink-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Applications
                </h3>
              </div>
              <ul className="space-y-3">
                {result.applications.map((application, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <ArrowRight size={20} className="text-pink-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{application}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>💡 Pro Tip:</strong> Save these insights to your Knowledge Vault for future reference.
              You can create flashcards or notes to deepen your understanding.
            </p>
          </div>
        </div>
      )}

      {!result && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Sparkles size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Ready to Create Magic?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter two concepts above and click "Collide Concepts" to discover unexpected connections
            and novel insights.
          </p>
        </div>
      )}
    </div>
  );
}
