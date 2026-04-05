import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Home from './pages/Home';
import Mindset from './pages/Mindset';
import Nutrition from './pages/Nutrition';
import Progress from './pages/Progress';
import Workouts from './pages/Workouts';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import __Layout from './Layout.jsx';

export const PAGES = {
  "Community": Community,
  "Dashboard": Dashboard,
  "Habits": Habits,
  "Home": Home,
  "Mindset": Mindset,
  "Nutrition": Nutrition,
  "Progress": Progress,
  "Workouts": Workouts,
  "Profile": Profile,
  "Admin": Admin,
};

export const pagesConfig = {
  mainPage: "Dashboard",
  Pages: PAGES,
  Layout: __Layout,
};
