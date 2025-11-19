import { useState, useEffect } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { LayoutDashboard, DoorOpen, Activity, Calendar, FileText, TrendingDown, Sun, Bell, Settings, User, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from './components/ui/badge';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import RoomControl from './components/RoomControl';
import EnergyMonitoring from './components/EnergyMonitoring';
import Scheduling from './components/Scheduling';
import BillingReport from './components/BillingReport';
import CostComparison from './components/CostComparison';
import GreenEnergy from './components/GreenEnergy';
import AlarmPage from './components/AlarmPage';
import SettingsPage from './components/SettingsPage';
import NotificationsPage from './components/NotificationsPage';
import { Button } from './components/ui/button';
import logoImage from 'figma:asset/5c52e23f7f375ac1e0785bc4a409701a70a18d7f.png';
import { websocketService, TOPICS } from './services/websocketService';

type PLCStatus = 'online' | 'offline' | 'connecting';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({ username: '', role: '' });
  const [plcStatus, setPlcStatus] = useState<PLCStatus>('connecting');
  const [notificationCount, setNotificationCount] = useState(3);

  // === CONNECT WEBSOCKET ===
    useEffect(() => {
      websocketService.connect()
    }, []);

    // Subscribe to PLC System Status
    useEffect(() => {
    const subscribePLC = websocketService.subscribe(TOPICS.SYSTEM_STATUS,(payload) => {
        const status = payload.system_online;

        // Kalau backend kirim "true"
        if (status === true) {
          setPlcStatus("online");
        }
        // Kalau backend kirim "false"
        else if (status === false) {
          setPlcStatus("offline");
        }
      }
    );
    return () => {
      subscribePLC();
    };
  }, []);

  // restore login on refresh
  useEffect(() => {
    const saved = localStorage.getItem("authUser");

    if (saved) {
      const user = JSON.parse(saved);
      setIsLoggedIn(true);
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = (username: string, role: string) => {
    setIsLoggedIn(true);
    setCurrentUser({ username, role });
    localStorage.setItem("authUser", JSON.stringify({ username, role }));
  };


  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser({ username: '', role: '' });
    setActiveView('dashboard');
    toast.success('Logged out successfully');
    localStorage.removeItem("authUser");
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'room-control', label: 'Room Control', icon: DoorOpen },
    { id: 'energy', label: 'Energy Monitoring', icon: Activity },
    { id: 'scheduling', label: 'Scheduling', icon: Calendar },
    { id: 'billing', label: 'Billing Report', icon: FileText },
    { id: 'cost-comparison', label: 'Cost Comparison', icon: TrendingDown },
    { id: 'green-energy', label: 'Green Energy', icon: Sun },
    { id: 'alarm', label: 'Alarm', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'room-control':
        return <RoomControl />;
      case 'energy':
        return <EnergyMonitoring />;
      case 'scheduling':
        return <Scheduling />;
      case 'billing':
        return <BillingReport />;
      case 'cost-comparison':
        return <CostComparison />;
      case 'green-energy':
        return <GreenEnergy />;
      case 'alarm':
        return <AlarmPage />;
      case 'settings':
        return <SettingsPage />;
      case 'notifications':
        return <NotificationsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="border-b border-sidebar-border px-6 py-2 bg-white">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <img 
                src={logoImage} 
                alt="SANINDO Orisa ENOSYS" 
                className="h-12 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">
                  SANINDO
                </span>
                <span className="text-xs text-muted-foreground">
                  Orisa ENOSYS
                </span>
              </div>
            </motion.div>
          </SidebarHeader>
          <SidebarContent className="bg-white">
            <SidebarMenu className="px-3 py-2">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveView(item.id)}
                      isActive={activeView === item.id}
                      className="transition-all duration-200 hover:bg-sidebar-accent data-[active=true]:bg-primary data-[active=true]:text-white h-11 text-base px-4"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1 overflow-auto bg-background">
          {/* Header */}
          <motion.div 
            className="border-b border-border bg-white px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <SidebarTrigger />
              <motion.h1
                key={activeView}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-base sm:text-xl font-semibold text-foreground truncate"
              >
                {menuItems.find(item => item.id === activeView)?.label || 'Dashboard'}
              </motion.h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* PLC Status - Dynamic based on connection */}
              <motion.div
                className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg transition-all ${
                  plcStatus === 'online' 
                    ? 'bg-green-50 border border-green-200' 
                    : plcStatus === 'connecting'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-red-50 border border-red-200'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div 
                  className={`h-2 w-2 rounded-full ${
                    plcStatus === 'online' 
                      ? 'bg-green-500 animate-pulse' 
                      : plcStatus === 'connecting'
                      ? 'bg-yellow-500 animate-ping'
                      : 'bg-red-500'
                  }`} 
                />
                <span className={`text-sm hidden sm:inline ${
                  plcStatus === 'online' 
                    ? 'text-green-700' 
                    : plcStatus === 'connecting'
                    ? 'text-yellow-700'
                    : 'text-red-700'
                }`}>
                  System {plcStatus === 'online' ? 'Online' : plcStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                </span>
              </motion.div>
              
              {/* Notification Bell - Clickable */}
              <button
                onClick={() => {
                  setActiveView('notifications');
                  setNotificationCount(0);
                }}
                className="relative hover:bg-muted p-2 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {notificationCount}
                  </Badge>
                )}
              </button>
              
              {/* User Profile - Hide details on mobile, show only avatar */}
              <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-border">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-medium">{currentUser.username}</span>
                  <span className="text-xs text-muted-foreground">{currentUser.role}</span>
                </div>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
          
          {renderContent()}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  );
}