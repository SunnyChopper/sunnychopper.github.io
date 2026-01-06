import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMode } from '../../contexts/ModeContext';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  TrendingUp,
  FolderKanban,
  BookOpen,
  Calendar,
  LogOut,
  Menu,
  X,
  Settings,
  Brain,
  ChevronDown,
  ChevronRight,
  Info,
  MessageCircle,
  Command,
  Film,
  Star,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { CommandPalette } from '../organisms/CommandPalette';
import LeisureModeToggle from '../atoms/LeisureModeToggle';
import { ROUTES } from '../../routes';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  children?: NavItem[];
  hideInLeisure?: boolean;
  hideInWork?: boolean;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: ROUTES.admin.dashboard, icon: LayoutDashboard },
  {
    name: 'Growth System',
    href: ROUTES.admin.growthSystem,
    icon: Brain,
    children: [
      { name: 'Tasks', href: ROUTES.admin.tasks, icon: CheckSquare, hideInLeisure: true },
      { name: 'Habits', href: ROUTES.admin.habits, icon: Calendar },
      { name: 'Metrics', href: ROUTES.admin.metrics, icon: TrendingUp, hideInLeisure: true },
      { name: 'Goals', href: ROUTES.admin.goals, icon: Target, hideInLeisure: true },
      { name: 'Projects', href: ROUTES.admin.projects, icon: FolderKanban, hideInLeisure: true },
      { name: 'Logbook', href: ROUTES.admin.logbook, icon: BookOpen },
    ],
  },
  { name: 'Media Backlog', href: ROUTES.admin.mediaBacklog, icon: Film, hideInWork: true },
  { name: 'Hobby Quests', href: ROUTES.admin.hobbyQuests, icon: Star, hideInWork: true },
  { name: 'Weekly Review', href: ROUTES.admin.weeklyReview, icon: Calendar },
  { name: 'Assistant', href: ROUTES.admin.assistant, icon: MessageCircle },
  { name: 'Settings', href: ROUTES.admin.settings, icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isLeisureMode } = useMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Growth System']);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const filteredNavigation = navigation.filter(item => {
    if (isLeisureMode && item.hideInLeisure) return false;
    if (!isLeisureMode && item.hideInWork) return false;
    return true;
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName]
    );
  };

  const isItemActive = (item: NavItem): boolean => {
    if (location.pathname === item.href) return true;
    if (item.children) {
      return item.children.some((child) => location.pathname === child.href);
    }
    return false;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Personal OS</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Search (Cmd+K)"
          >
            <Command size={20} />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personal OS</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{user?.email}</p>
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full mt-3 flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <Command size={16} />
              <span className="flex-1 text-left">Quick Search</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">⌘K</kbd>
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);
              const isExpanded = expandedItems.includes(item.name);
              const filteredChildren = item.children?.filter(child => {
                if (isLeisureMode && child.hideInLeisure) return false;
                if (!isLeisureMode && child.hideInWork) return false;
                return true;
              });
              const hasChildren = filteredChildren && filteredChildren.length > 0;

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                          isActive
                            ? 'accent-bg-50 dark:bg-green-900/30 accent-text-700 dark:accent-text-400 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="flex-1 text-left">{item.name}</span>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      {isExpanded && filteredChildren && (
                        <div className="ml-4 mt-1 space-y-1">
                          <Link
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${
                              location.pathname === item.href
                                ? 'accent-bg-50 dark:bg-green-900/30 accent-text-700 dark:accent-text-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Info size={18} />
                            <span>Overview</span>
                          </Link>
                          {filteredChildren.map((child) => {
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.name}
                                to={child.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${
                                  location.pathname === child.href
                                    ? 'accent-bg-50 dark:bg-green-900/30 accent-text-700 dark:accent-text-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <ChildIcon size={18} />
                                <span>{child.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        isActive
                          ? 'accent-bg-50 dark:bg-green-900/30 accent-text-700 dark:accent-text-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          <LeisureModeToggle />

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition w-full"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:ml-64 min-h-screen">
        <div className="pt-20 lg:pt-8 px-6 lg:px-12 pb-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
