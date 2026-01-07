import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle2,
  Circle,
  ChevronRight,
  Sparkles,
  Play,
} from 'lucide-react';
import { coursesService, vaultItemsService, aiCourseGeneratorService } from '../../services/knowledge-vault';
import type { CourseWithDetails } from '../../services/knowledge-vault/courses.service';
import type { CourseLesson } from '../../types/knowledge-vault';
import { ROUTES } from '../../routes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function CourseDetailPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId?: string }>();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState<CourseWithDetails | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  useEffect(() => {
    if (lessonId && courseData) {
      const lesson = courseData.modules
        .flatMap(m => m.lessons)
        .find(l => l.id === lessonId);
      if (lesson) {
        loadLessonContent(lesson);
      }
    }
  }, [lessonId, courseData]);

  const loadCourseData = async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await coursesService.getCourseWithModulesAndLessons(courseId);

      if (response.success && response.data) {
        setCourseData(response.data);
      } else {
        setError(response.error || 'Failed to load course');
      }
    } catch (err) {
      setError('An error occurred while loading the course');
    } finally {
      setLoading(false);
    }
  };

  const loadLessonContent = async (lesson: CourseLesson) => {
    setSelectedLesson(lesson);
    await vaultItemsService.markAccessed(lesson.id);

    if (!lesson.content) {
      await generateLessonContent(lesson);
    }
  };

  const generateLessonContent = async (lesson: CourseLesson) => {
    if (!courseData) return;

    setGeneratingContent(true);

    try {
      const module = courseData.modules.find(m =>
        m.lessons.some(l => l.id === lesson.id)
      );

      if (!module) return;

      const totalLessons = module.lessons.length;

      const response = await aiCourseGeneratorService.generateLessonContent({
        courseTitle: courseData.course.title,
        moduleTitle: module.module.title,
        lessonTitle: lesson.title,
        lessonIndex: lesson.lessonIndex,
        totalLessons,
        difficulty: courseData.course.difficulty,
      });

      if (response.success && response.data) {
        await vaultItemsService.update(lesson.id, {
          content: response.data,
        });

        setSelectedLesson(prev => prev ? { ...prev, content: response.data } : null);

        const updatedCourseData = await coursesService.getCourseWithModulesAndLessons(courseId!);
        if (updatedCourseData.success && updatedCourseData.data) {
          setCourseData(updatedCourseData.data);
        }
      }
    } catch (err) {
      console.error('Error generating lesson content:', err);
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleLessonClick = (lesson: CourseLesson) => {
    navigate(`${ROUTES.admin.knowledgeVaultCourses}/${courseId}/${lesson.id}`);
  };

  const handleMarkComplete = async () => {
    if (!selectedLesson) return;

    await vaultItemsService.markLessonComplete(selectedLesson.id);
    await loadCourseData();

    const currentModuleLessons = courseData?.modules
      .find(m => m.lessons.some(l => l.id === selectedLesson.id))
      ?.lessons || [];

    const currentIndex = currentModuleLessons.findIndex(l => l.id === selectedLesson.id);
    const nextLesson = currentModuleLessons[currentIndex + 1];

    if (nextLesson) {
      handleLessonClick(nextLesson);
    }
  };

  const getTotalLessons = () => {
    return courseData?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
  };

  const getCompletedLessons = () => {
    return courseData?.modules.reduce(
      (acc, m) => acc + m.lessons.filter(l => l.completedAt).length,
      0
    ) || 0;
  };

  const getProgressPercentage = () => {
    const total = getTotalLessons();
    const completed = getCompletedLessons();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error || 'Course not found'}</p>
        <button
          onClick={() => navigate(ROUTES.admin.knowledgeVaultCourses)}
          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div>
          <button
            onClick={() => navigate(ROUTES.admin.knowledgeVaultCourses)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Courses</span>
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {courseData.course.title}
            </h1>
            {courseData.course.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {courseData.course.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <BookOpen size={16} />
                {getTotalLessons()} lessons
              </span>
              {courseData.course.estimatedHours && (
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {courseData.course.estimatedHours}h
                </span>
              )}
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getProgressPercentage()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getCompletedLessons()} of {getTotalLessons()} lessons completed
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 max-h-[600px] overflow-y-auto">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Course Content</h2>

          <div className="space-y-4">
            {courseData.modules.map((moduleData, moduleIndex) => (
              <div key={moduleData.module.id}>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Module {moduleIndex + 1}: {moduleData.module.title}
                </h3>

                <div className="space-y-1">
                  {moduleData.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${
                        selectedLesson?.id === lesson.id
                          ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {lesson.completedAt ? (
                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <Circle size={20} className="text-gray-400 flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {lesson.title}
                        </p>
                        {lesson.estimatedMinutes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {lesson.estimatedMinutes} min
                          </p>
                        )}
                      </div>

                      <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedLesson ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedLesson.title}
              </h2>
              {selectedLesson.estimatedMinutes && (
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Clock size={16} />
                  {selectedLesson.estimatedMinutes} minutes
                </p>
              )}
            </div>

            {generatingContent ? (
              <div className="text-center py-12">
                <Sparkles size={48} className="mx-auto text-green-600 dark:text-green-400 animate-pulse mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Generating lesson content with AI...
                </p>
              </div>
            ) : selectedLesson.content ? (
              <>
                <div className="prose dark:prose-invert max-w-none mb-8">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedLesson.content}
                  </ReactMarkdown>
                </div>

                {!selectedLesson.completedAt && (
                  <button
                    onClick={handleMarkComplete}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                  >
                    <CheckCircle2 size={20} />
                    <span>Mark as Complete</span>
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Play size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Content not yet generated
                </p>
                <button
                  onClick={() => generateLessonContent(selectedLesson)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  <Sparkles size={20} />
                  <span>Generate Lesson Content</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Select a lesson from the sidebar to begin learning
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
