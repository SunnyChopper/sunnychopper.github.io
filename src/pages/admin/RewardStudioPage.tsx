import { useState } from 'react';
import { Palette, Plus, Trash2 } from 'lucide-react';
import { useRewards } from '../../contexts/RewardsContext';
import { RewardCard } from '../../components/molecules/RewardCard';
import Dialog from '../../components/organisms/Dialog';
import type {
  RewardWithRedemptions,
  CreateRewardInput,
  UpdateRewardInput,
  RewardCategory,
} from '../../types/rewards';

const categories: RewardCategory[] = ['Quick Treat', 'Daily Delight', 'Big Unlock', 'Custom'];

const RewardStudioPage = () => {
  const { rewards, loading, createReward, updateReward, deleteReward } = useRewards();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<RewardWithRedemptions | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<CreateRewardInput | UpdateRewardInput>({
    title: '',
    description: '',
    category: 'Quick Treat',
    pointCost: 100,
    icon: '🎁',
    cooldownHours: undefined,
    maxRedemptionsPerDay: undefined,
  });

  const openCreateDialog = () => {
    setEditingReward(null);
    setFormData({
      title: '',
      description: '',
      category: 'Quick Treat',
      pointCost: 100,
      icon: '🎁',
      cooldownHours: undefined,
      maxRedemptionsPerDay: undefined,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (reward: RewardWithRedemptions) => {
    setEditingReward(reward);
    setFormData({
      title: reward.title,
      description: reward.description || '',
      category: reward.category,
      pointCost: reward.pointCost,
      icon: reward.icon || '🎁',
      cooldownHours: reward.cooldownHours ?? undefined,
      maxRedemptionsPerDay: reward.maxRedemptionsPerDay ?? undefined,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingReward) {
        await updateReward(editingReward.id, formData as UpdateRewardInput);
      } else {
        await createReward(formData as CreateRewardInput);
      }
      setIsDialogOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save reward');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reward: RewardWithRedemptions) => {
    const confirmed = confirm(`Delete "${reward.title}"?`);
    if (!confirmed) return;

    try {
      await deleteReward(reward.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete reward');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Palette size={32} className="text-blue-600 dark:text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reward Studio
            </h1>
          </div>
          <button
            onClick={openCreateDialog}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Create Reward
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Design and manage your custom reward system
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : rewards.length === 0 ? (
        <div className="text-center py-12">
          <Palette size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Rewards Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first reward to get started
          </p>
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Create Reward
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="relative group">
              <RewardCard
                reward={reward}
                onEdit={openEditDialog}
                showEditButton
              />
              <button
                onClick={() => handleDelete(reward)}
                className="absolute top-2 left-2 p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete reward"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editingReward ? 'Edit Reward' : 'Create Reward'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as RewardCategory })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Point Cost
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.pointCost}
                onChange={(e) =>
                  setFormData({ ...formData, pointCost: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icon
            </label>
            <input
              type="text"
              value={formData.icon || ''}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🎁"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cooldown Hours
              </label>
              <input
                type="number"
                min="0"
                value={formData.cooldownHours ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cooldownHours: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Daily Redemptions
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxRedemptionsPerDay ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxRedemptionsPerDay: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingReward ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default RewardStudioPage;
