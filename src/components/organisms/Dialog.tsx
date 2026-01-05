import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Dialog({ isOpen, onClose, title, children, className }: DialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={cn(
                'bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full pointer-events-auto relative my-8 max-h-[calc(100vh-4rem)] flex flex-col',
                className
              )}
            >
              <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>

                {title && (
                  <h3 className="text-2xl font-bold pr-8 text-gray-900 dark:text-white">{title}</h3>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 text-gray-700 dark:text-gray-300">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
