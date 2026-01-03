import { motion } from 'framer-motion';
import type { Skill } from '../../types';

interface SkillCardProps {
  skill: Skill;
  onClick: () => void;
  index: number;
}

export default function SkillCard({ skill, onClick, index }: SkillCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center"
    >
      <img
        src={skill.icon}
        alt={skill.title}
        className="w-20 h-20 object-contain mb-4"
      />
      <h4 className="text-xl font-bold text-gray-900 mb-2">{skill.title}</h4>
      <p className="text-sm text-gray-600 mb-1">{skill.category}</p>
      <p className="text-sm text-gray-500">{skill.experience}</p>
    </motion.div>
  );
}
