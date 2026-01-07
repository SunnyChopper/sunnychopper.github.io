import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { aiCourseGeneratorService } from '../../services/knowledge-vault';
import type { PreAssessmentQuestion, DifficultyLevel } from '../../types/knowledge-vault';
import { ROUTES } from '../../routes';

type Step = 'topic' | 'assessment' | 'generating' | 'review';

const DIFFICULTIES: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function CourseGeneratorPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('topic');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [assessmentQuestions, setAssessmentQuestions] = useState<PreAssessmentQuestion[]>([]);
  const [assessmentResponses, setAssessmentResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCourseId, setGeneratedCourseId] = useState<string | null>(null);

  const handleTopicSubmit = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiCourseGeneratorService.generatePreAssessment({
        topic,
        targetDifficulty: difficulty,
      });

      if (response.success && response.data) {
        setAssessmentQuestions(response.data.questions);
        setStep('assessment');
      } else {
        setError(response.error || 'Failed to generate assessment');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentSubmit = async () => {
    if (Object.keys(assessmentResponses).length < assessmentQuestions.length) {
      setError('Please answer all questions');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('generating');

    try {
      const skeletonResponse = await aiCourseGeneratorService.generateCourseSkeleton({
        topic,
        assessmentResponses,
        targetDifficulty: difficulty,
      });

      if (skeletonResponse.success && skeletonResponse.data) {
        const courseResponse = await aiCourseGeneratorService.createCourseFromSkeleton(
          skeletonResponse.data
        );

        if (courseResponse.success && courseResponse.data) {
          setGeneratedCourseId(courseResponse.data.id);
          setStep('review');
        } else {
          setError(courseResponse.error || 'Failed to create course');
          setStep('assessment');
        }
      } else {
        setError(skeletonResponse.error || 'Failed to generate course');
        setStep('assessment');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setStep('assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAssessmentResponses(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(ROUTES.admin.knowledgeVaultCourses)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Course Generator</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a personalized learning course tailored to your needs
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'topic' ? 'bg-green-600 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
            1
          </div>
          <div className="w-16 h-1 bg-gray-300 dark:bg-gray-700" />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'assessment' || step === 'generating' || step === 'review' ? 'bg-green-600 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
            2
          </div>
          <div className="w-16 h-1 bg-gray-300 dark:bg-gray-700" />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-green-600 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
            3
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {step === 'topic' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            What do you want to learn?
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., React Hooks, Python Data Science, AWS Lambda"
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Target Difficulty Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DIFFICULTIES.map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-4 py-3 rounded-lg border-2 transition capitalize ${
                      difficulty === level
                        ? 'border-green-600 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleTopicSubmit}
              disabled={loading || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition text-lg font-medium"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Generating Assessment...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 'assessment' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Quick Assessment
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Help us understand your current knowledge level to personalize your course
          </p>

          <div className="space-y-6 mb-8">
            {assessmentQuestions.map((question, index) => (
              <div key={question.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white mb-3">
                  {index + 1}. {question.questionText}
                </p>

                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-gray-800 rounded-lg cursor-pointer transition"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={assessmentResponses[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('topic')}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
            >
              Back
            </button>
            <button
              onClick={handleAssessmentSubmit}
              disabled={loading || Object.keys(assessmentResponses).length < assessmentQuestions.length}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
            >
              <Sparkles size={20} />
              <span>Generate My Course</span>
            </button>
          </div>
        </div>
      )}

      {step === 'generating' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <Sparkles size={32} className="text-green-600 dark:text-green-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Generating Your Course
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            AI is creating a personalized learning path just for you...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      )}

      {step === 'review' && generatedCourseId && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <Sparkles size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Your Course is Ready!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We've created a personalized {topic} course tailored to your knowledge level
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(ROUTES.admin.knowledgeVaultCourses)}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
            >
              Back to Courses
            </button>
            <button
              onClick={() => navigate(`${ROUTES.admin.knowledgeVaultCourses}/${generatedCourseId}`)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
            >
              Start Learning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
