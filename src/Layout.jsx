import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Dumbbell,
  Salad,
  Brain,
  TrendingUp,
  Users,
  Menu,
  X,
  Zap,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const navigationItems = [
  { title: "Dashboard", url: "Dashboard", icon: LayoutDashboard },
  { title: "Workouts", url: "Workouts", icon: Dumbbell },
  { title: "Nutrition", url: "Nutrition", icon: Salad },
  { title: "Habits", url: "Habits", icon: Target },
  { title: "Mindset", url: "Mindset", icon: Brain },
  { title: "Progress", url: "Progress", icon: TrendingUp },
  { title: "Community", url: "Community", icon: Users },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const calculateDayNumber = () => {
    if (!user?.program_start_date) return 1;
    const start = new Date(user.program_start_date);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, 90);
  };

  const totalXP = (user?.mindset_xp || 0) + (user?.workout_xp || 0) + (user?.nutrition_xp || 0);
  const level = Math.floor(totalXP / 1000) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <style>{`
        :root {
          --primary: 222 47% 11%;
          --primary-foreground: 210 40% 98%;
          --secondary: 217 91% 60%;
          --accent: 142 76% 36%;
          --destructive: 0 84% 60%;
        }
      `}</style>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                  {level}
                </div>
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">RECOMP</h1>
                <p className="text-xs text-gray-500">Day {calculateDayNumber()} • Level {level}</p>
              </div>
            </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <nav className="px-4 py-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={createPageUrl(item.url)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    location.pathname === createPageUrl(item.url)
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-white/80 backdrop-blur-md border-r border-gray-200 flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">
                  {level}
                </div>
              </div>
              <div>
                <h1 className="font-bold text-2xl text-gray-900">RECOMP</h1>
                <p className="text-sm text-gray-500">Level {level} • {totalXP} XP</p>
              </div>
            </div>
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-violet-700 rounded-2xl p-5 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold opacity-90">Your Journey</div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                LVL {level}
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">Day {calculateDayNumber()}</div>
            <div className="text-xs opacity-75 mb-3">{totalXP} Total XP</div>
            <div className="space-y-2">
              <div className="bg-white/20 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${(calculateDayNumber() / 90) * 100}%` }}
                />
              </div>
              <div className="text-xs opacity-90">{90 - calculateDayNumber()} days until transformation</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                to={createPageUrl(item.url)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === createPageUrl(item.url)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{user?.full_name?.[0] || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user?.full_name || 'User'}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}