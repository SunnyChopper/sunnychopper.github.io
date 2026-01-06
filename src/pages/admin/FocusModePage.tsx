import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Sparkles,
  Trophy,
  Play,
  Pause
} from 'lucide-react';
import type { Task } from '../../types/growth-system';
import { useTasks } from '../../hooks/useGrowthSystem';
import { ROUTES } from '../../routes';

const POMODORO_DURATION = 25 * 60;

export default function FocusModePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateTask } = useTasks();

  const [sessionTasks, setSessionTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_DURATION);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  useEffect(() => {
    const state = location.state as { sessionTasks?: Task[] };
    if (state?.sessionTasks && state.sessionTasks.length > 0) {
      setSessionTasks(state.sessionTasks);
    } else {
      navigate(ROUTES.admin.dashboard);
    }
  }, [location, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const currentTask = sessionTasks[currentTaskIndex];
  const progress = ((currentTaskIndex + 1) / sessionTasks.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteTask = async () => {
    if (!currentTask) return;

    await updateTask({
      id: currentTask.id,
      input: {
        status: 'Done',
        completedDate: new Date().toISOString(),
      }
    });

    setCompletedTasks(prev => [...prev, currentTask.id]);

    if (currentTaskIndex < sessionTasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      setTimeRemaining(POMODORO_DURATION);
      setIsTimerRunning(false);
    }
  };

  const handleExitFocus = () => {
    navigate(ROUTES.admin.dashboard);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setTimeRemaining(POMODORO_DURATION);
    setIsTimerRunning(false);
  };

  if (!currentTask) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: 'spring', duration: 0.8 }}
          >
            <Trophy className="w-32 h-32 text-yellow-400 mx-auto mb-8" />
          </motion.div>
          <h1 className="text-5xl font-bold text-white mb-4">Session Complete!</h1>
          <p className="text-2xl text-emerald-200 mb-8">
            You completed {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={handleExitFocus}
            className="px-8 py-4 bg-white text-emerald-900 rounded-xl font-bold text-xl hover:bg-emerald-50 transition-colors"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex flex-col overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gray-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
        />
      </div>

      <div className="absolute top-4 left-4 text-white/60 text-sm font-medium">
        Task {currentTaskIndex + 1} of {sessionTasks.length}
      </div>

      <button
        onClick={handleExitFocus}
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          key={currentTask.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="max-w-4xl w-full"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6 ${
                currentTask.priority === 'P1' ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
                currentTask.priority === 'P2' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50' :
                currentTask.priority === 'P3' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' :
                'bg-green-500/20 text-green-300 border border-green-500/50'
              }`}>
                {currentTask.priority} • {currentTask.area}
              </span>
            </motion.div>

            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight"
            >
              {currentTask.title}
            </motion.h1>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-8 mb-12"
            >
              <div className="flex flex-col items-center">
                <Clock className="w-8 h-8 text-blue-400 mb-2" />
                <div className="text-6xl font-bold text-white mb-2 font-mono">
                  {formatTime(timeRemaining)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTimer}
                    className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                  >
                    {isTimerRunning ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4"
            >
              <button
                onClick={handleCompleteTask}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                <CheckCircle2 className="w-6 h-6" />
                Complete Task
              </button>
            </motion.div>
          </div>

          {currentTask.description && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => setIsContextOpen(!isContextOpen)}
                className="w-full max-w-2xl mx-auto p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-medium">Task Details</span>
                </div>
                {isContextOpen ? (
                  <ChevronUp className="w-5 h-5 text-white/60" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/60" />
                )}
              </button>

              <AnimatePresence>
                {isContextOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="max-w-2xl mx-auto mt-4 p-6 bg-white/5 rounded-xl">
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {currentTask.description}
                      </p>
                      {currentTask.extendedDescription && (
                        <p className="text-gray-400 text-base leading-relaxed mt-4">
                          {currentTask.extendedDescription}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-6">
                        {currentTask.size && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-white">{currentTask.size}h estimated</span>
                          </div>
                        )}
                        {currentTask.dueDate && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                            <Target className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-white">
                              Due {new Date(currentTask.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          {sessionTasks.map((task, index) => (
            <div
              key={task.id}
              className={`h-2 flex-1 rounded-full transition-all ${
                index < currentTaskIndex
                  ? 'bg-green-500'
                  : index === currentTaskIndex
                  ? 'bg-blue-500'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
