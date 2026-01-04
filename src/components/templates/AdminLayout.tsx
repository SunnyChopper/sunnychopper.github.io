import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  {
    name: 'Growth System',
    href: '/admin/growth-system',
    icon: Brain,
    children: [
      { name: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
      { name: 'Habits', href: '/admin/habits', icon: Calendar },
      { name: 'Metrics', href: '/admin/metrics', icon: TrendingUp },
      { name: 'Goals', href: '/admin/goals', icon: Target },
      { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
      { name: 'Logbook', href: '/admin/logbook', icon: BookOpen },
    ],
  },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Growth System']);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Personal OS</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Personal OS</h1>
            <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
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
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
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
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            Overview
                          </Link>
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.name}
                                to={child.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${
                                  location.pathname === child.href
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
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
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
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

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition w-full"
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
