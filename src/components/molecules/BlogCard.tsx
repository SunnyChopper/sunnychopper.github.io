import { motion } from 'framer-motion';
import type { BlogPost } from '../../types';

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

export default function BlogCard({ post, index }: BlogCardProps) {
  return (
    <motion.a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="aspect-video w-full overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <h4 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{post.title}</h4>
        <p className="text-gray-700 mb-4 line-clamp-3">{post.summary}</p>
        <p className="text-sm text-gray-500">Written {post.date} on Medium</p>
      </div>
    </motion.a>
  );
}
