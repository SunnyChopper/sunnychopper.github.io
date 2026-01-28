import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/Auth';
import { useMode } from '@/contexts/Mode';
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
  Activity,
  Brain,
  ChevronDown,
  ChevronRight,
  Info,
  MessageCircle,
  Command,
  Film,
  Star,
  Coffee,
  Store,
  Palette,
  Library,
  GraduationCap,
  Network,
  Layers,
  Sparkles,
  Wrench,
  FileText,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { CommandPalette } from '@/components/organisms/CommandPalette';
import { DebugInspector } from '@/components/organisms/DebugInspector';
import LeisureModeToggle from '@/components/atoms/LeisureModeToggle';
import { WalletWidget } from '@/components/molecules/WalletWidget';
import { BackendStatusBanner } from '@/components/molecules/BackendStatusBanner';
import { ROUTES } from '@/routes';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  children?: NavItem[];
  hideInLeisure?: boolean;
  hideInWork?: boolean;
}

const workNavigation: NavItem[] = [
  { name: 'Dashboard', href: ROUTES.admin.dashboard, icon: LayoutDashboard },
  { name: 'Assistant', href: ROUTES.admin.assistant, icon: MessageCircle },
  {
    name: 'Growth System',
    href: ROUTES.admin.growthSystem,
    icon: Activity,
    children: [
      { name: 'Tasks', href: ROUTES.admin.tasks, icon: CheckSquare },
      { name: 'Habits', href: ROUTES.admin.habits, icon: Calendar },
      { name: 'Metrics', href: ROUTES.admin.metrics, icon: TrendingUp },
      { name: 'Goals', href: ROUTES.admin.goals, icon: Target },
      { name: 'Projects', href: ROUTES.admin.projects, icon: FolderKanban },
      { name: 'Logbook', href: ROUTES.admin.logbook, icon: BookOpen },
      { name: 'Weekly Review', href: ROUTES.admin.weeklyReview, icon: Calendar },
    ],
  },
  {
    name: 'Knowledge Vault',
    href: ROUTES.admin.knowledgeVault,
    icon: Brain,
    children: [
      { name: 'Library', href: ROUTES.admin.knowledgeVaultLibrary, icon: Library },
      { name: 'Courses', href: ROUTES.admin.knowledgeVaultCourses, icon: GraduationCap },
      { name: 'Skill Tree', href: ROUTES.admin.knowledgeVaultSkillTree, icon: Network },
      { name: 'Flashcards', href: ROUTES.admin.knowledgeVaultFlashcards, icon: Layers },
      { name: 'Concept Collider', href: ROUTES.admin.knowledgeVaultCollider, icon: Sparkles },
    ],
  },
  {
    name: 'Tools',
    href: ROUTES.admin.tools,
    icon: Wrench,
    children: [{ name: 'Markdown', href: ROUTES.admin.markdownViewer, icon: FileText }],
  },
  { name: 'Reward Studio', href: ROUTES.admin.rewardStudio, icon: Palette },
  { name: 'Settings', href: ROUTES.admin.settings, icon: Settings },
];

const leisureNavigation: NavItem[] = [
  { name: 'Zen Dashboard', href: ROUTES.admin.zenDashboard, icon: Coffee },
  { name: 'Logbook', href: ROUTES.admin.logbook, icon: BookOpen },
  { name: 'Media Backlog', href: ROUTES.admin.mediaBacklog, icon: Film },
  { name: 'Hobby Quests', href: ROUTES.admin.hobbyQuests, icon: Star },
  { name: 'Rewards Store', href: ROUTES.admin.rewardsStore, icon: Store },
  { name: 'Assistant', href: ROUTES.admin.assistant, icon: MessageCircle },
  { name: 'Settings', href: ROUTES.admin.settings, icon: Settings },
];

const SIDEBAR_WIDTH_STORAGE_KEY = 'sidebar-width';
const DEFAULT_SIDEBAR_WIDTH = 256; // w-64 = 256px

// Min/max widths based on breakpoints
const getMinWidth = () => {
  if (typeof window === 'undefined') return 200;
  if (window.innerWidth >= 1024) return 240; // lg: 1024px+
  if (window.innerWidth >= 768) return 220; // md: 768px+
  return 200; // sm and below
};

const getMaxWidth = () => {
  if (typeof window === 'undefined') return 400;
  if (window.innerWidth >= 1024) return 480; // lg: 1024px+
  if (window.innerWidth >= 768) return 400; // md: 768px+
  return 320; // sm and below
};

export default function AdminLayout() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isLeisureMode } = useMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    return stored
      ? Math.max(getMinWidth(), Math.min(getMaxWidth(), parseInt(stored, 10)))
      : DEFAULT_SIDEBAR_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);

  const navigation = isLeisureMode ? leisureNavigation : workNavigation;

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
    // Check if path starts with item href (for nested routes like markdown-viewer files)
    if (location.pathname.startsWith(item.href + '/')) return true;
    if (item.children) {
      return item.children.some((child) => {
        if (location.pathname === child.href) return true;
        // Check if path starts with child href (for nested routes)
        return location.pathname.startsWith(child.href + '/');
      });
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

  // Handle resize on window resize to update min/max constraints
  useEffect(() => {
    const handleResize = () => {
      const minWidth = getMinWidth();
      const maxWidth = getMaxWidth();
      setSidebarWidth((prev) => Math.max(minWidth, Math.min(maxWidth, prev)));
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persist sidebar width to localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      resizeStartX.current = e.clientX;
      resizeStartWidth.current = sidebarWidth;
    },
    [sidebarWidth]
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStartX.current;
      const newWidth = resizeStartWidth.current + deltaX;
      const minWidth = getMinWidth();
      const maxWidth = getMaxWidth();

      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setSidebarWidth(constrainedWidth);
    },
    [isResizing]
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <DebugInspector />

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Personal OS</h1>
        <div className="flex items-center gap-2">
          <WalletWidget />
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
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isResizing ? 'select-none transition-none' : 'transition-transform duration-200 ease-in-out'}`}
        style={{
          width: `${sidebarWidth}px`,
          minWidth: `${getMinWidth()}px`,
          maxWidth: `${getMaxWidth()}px`,
        }}
      >
        <div className="flex flex-col h-full relative">
          {/* Resize handle */}
          <div
            onMouseDown={handleResizeStart}
            className={`absolute top-0 right-0 w-1 h-full cursor-col-resize z-50 lg:block hidden ${
              isResizing ? 'bg-blue-500' : 'hover:bg-blue-400/50'
            }`}
            style={{
              touchAction: 'none',
              // Make it easier to grab by extending the hit area
              marginRight: '-2px',
              paddingRight: '2px',
            }}
            aria-label="Resize sidebar"
            role="separator"
            aria-orientation="vertical"
          />

          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personal OS</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{user?.email}</p>
            <div className="mt-3 flex justify-center">
              <WalletWidget />
            </div>
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full mt-3 flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <Command size={16} />
              <span className="flex-1 text-left">Quick Search</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);
              const isExpanded = expandedItems.includes(item.name);
              const hasChildren = item.children && item.children.length > 0;

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
                      {isExpanded && item.children && (
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
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive =
                              location.pathname === child.href ||
                              location.pathname.startsWith(child.href + '/');
                            return (
                              <Link
                                key={child.name}
                                to={child.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${
                                  isChildActive
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

      <div
        className={cn(
          'transition-all duration-200',
          location.pathname.startsWith('/admin/markdown-viewer')
            ? 'h-screen overflow-hidden'
            : 'min-h-screen'
        )}
        style={{ marginLeft: isLargeScreen ? `${sidebarWidth}px` : '0' }}
      >
        {location.pathname.startsWith('/admin/markdown-viewer') ? (
          <Outlet />
        ) : (
          <div className="pt-20 lg:pt-8 px-6 lg:px-12 pb-12">
            <BackendStatusBanner className="-mx-6 lg:-mx-12 -mt-6 lg:-mt-8 mb-6" />
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
}
