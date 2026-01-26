import { motion } from 'framer-motion';

interface LoaderProps {
  isLoading: boolean;
}

export default function Loader({ isLoading }: LoaderProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[9999] flex items-center justify-center">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 border-[5px] border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"
        />
      </div>
    </div>
  );
}
