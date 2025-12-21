import React, { useState, useEffect } from 'react';
import { FocusSector, Task, DailyStats } from './types';
import { INITIAL_SECTORS, ICONS } from './constants';
import { calculateDailyStats } from './statsCalculations';
import { useLocalStorage } from './useLocalStorage';
import SectorCard from './components/SectorCard';
import Tooltip from './components/Tooltip';
import StatsPanel from './StatsPanel';
import DailyReview from './components/DailyReview';

const App: React.FC = () => {
  const [sectors, setSectors] = useLocalStorage<FocusSector[]>('daily-task-sectors', INITIAL_SECTORS);
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'light');
  const [stats, setStats] = useLocalStorage<DailyStats[]>('daily-stats', []);
  const [showStats, setShowStats] = useState(false);
  const [showDailyReview, setShowDailyReview] = useState(false);
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);

  // دالة للحصول على القطاع المناسب للوقت الحالي
  const getCurrentSector = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // تعريف الأوقات لكل قطاع
    const timeRanges = [
      { id: 'sleep-early', start: 0, end: 6 },     // 12AM-6AM
      { id: 'morning-routine', start: 6, end: 8 }, // 6AM-8AM
      { id: 'deep-work-1', start: 8, end: 11 },    // 8AM-11AM
      { id: 'creative-flow', start: 11, end: 14 }, // 11AM-2PM
      { id: 'lunch-break', start: 14, end: 15 },   // 2PM-3PM
      { id: 'deep-work-2', start: 15, end: 18 },   // 3PM-6PM
      { id: 'evening-winddown', start: 18, end: 21 }, // 6PM-9PM
      { id: 'night-routine', start: 21, end: 24 }  // 9PM-12AM
    ];
    
    for (const range of timeRanges) {
      if (currentHour >= range.start && currentHour < range.end) {
        return sectors.find(s => s.id === range.id);
      }
    }
    
    return sectors[0]; // Default to first if not found
  };

  // Update theme
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  // Auto-reset at midnight (12 AM)
  useEffect(() => {
    const checkForReset = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // If it's 12:00 - 12:05 AM
      if (hours === 0 && minutes >= 0 && minutes <= 5) {
        const lastReset = localStorage.getItem('lastMidnightReset');
        const today = new Date().toISOString().split('T')[0];
        
        // If not reset today
        if (lastReset !== today) {
          // Clear tasks only (keep sector names/descriptions)
          setSectors(sectors.map(sector => ({
            ...sector,
            tasks: [] // Clear tasks only
          })));
          
          localStorage.setItem('lastMidnightReset', today);
          console.log('Daily reset completed at midnight');
        }
      }
    };
    
    // Check every minute
    const interval = setInterval(checkForReset, 60000);
    checkForReset(); // Check immediately on load
    
    return () => clearInterval(interval);
  }, [sectors, setSectors]);

  // Update stats when tasks change
  useEffect(() => {
    const todayStats = calculateDailyStats(sectors);
    const existingStatIndex = stats.findIndex(s => s.date === currentDate);
    
    const updatedStats = [...stats];
    if (existingStatIndex >= 0) {
      updatedStats[existingStatIndex] = {
        ...updatedStats[existingStatIndex],
        ...todayStats
      };
    } else {
      updatedStats.push(todayStats);
    }
    
    setStats(updatedStats);
  }, [sectors, currentDate, stats]);

  // Check if should show daily review (end of day)
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const todayStat = stats.find(s => s.date === currentDate);
    
    // Show review at end of day if not already rated
    if (hour >= 20 && !todayStat?.dailyRating && !showDailyReview) {
      setShowDailyReview(true);
    }
  }, [currentDate, stats, showDailyReview]);

  // Handle updating a sector
  const handleUpdateSector = (sectorId: string, updates: Partial<FocusSector>) => {
    setSectors(sectors.map(s => 
      s.id === sectorId 
        ? { ...s, ...updates }
        : s
    ));
  };

  const handleAddTask = (sectorId: string, taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: taskData.text || '',
      completed: false,
      createdAt: Date.now(),
      priority: taskData.priority || 'normal',
      progress: 0,
      estimatedTime: 0,
      timeSpent: 0,
      notes: taskData.notes
    };
    
    setSectors(sectors.map(s => 
      s.id === sectorId 
        ? { ...s, tasks: [...s.tasks, newTask] }
        : s
    ));
  };

  const handleUpdateTask = (sectorId: string, taskId: string, updates: Partial<Task>) => {
    setSectors(sectors.map(s => 
      s.id === sectorId 
        ? { 
            ...s, 
            tasks: s.tasks.map(t => 
              t.id === taskId 
                ? { ...t, ...updates } 
                : t
            )
          }
        : s
    ));
  };

  const handleDeleteTask = (sectorId: string, taskId: string) => {
    setSectors(sectors.map(s => 
      s.id === sectorId 
        ? { ...s, tasks: s.tasks.filter(t => t.id !== taskId) }
        : s
    ));
  };

  const handleSaveDailyReview = (rating: number, notes: string) => {
    const updatedStats = stats.map(stat => 
      stat.date === currentDate 
        ? { ...stat, dailyRating: rating, notes }
        : stat
    );
    setStats(updatedStats);
  };

  const todayStat = stats.find(s => s.date === currentDate);
  const totalTasks = sectors.reduce((sum, s) => sum + s.tasks.length, 0);
  const completedTasks = sectors.reduce((sum, s) => 
    sum + s.tasks.filter(t => t.completed).length, 0
  );

  const currentSector = getCurrentSector();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg">
              📊
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Daily Task Manager</h1>
              {todayStat && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold">
                    {completedTasks}/{totalTasks} tasks
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip text="Analytics Dashboard">
              <button 
                onClick={() => setShowStats(true)}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all hover:scale-105"
              >
                📈
              </button>
            </Tooltip>
            
            {/* Clear All Data Button */}
            <Tooltip text="Clear All Data (Reset Everything)">
              <button 
                onClick={() => {
                  if (window.confirm('⚠️ Are you sure you want to clear ALL data?\n\nThis will delete:\n• All tasks\n• All statistics\n• All daily reviews\n\nThis action cannot be undone!')) {
                    // Clear localStorage
                    localStorage.removeItem('daily-task-sectors');
                    localStorage.removeItem('daily-stats');
                    localStorage.removeItem('theme');
                    localStorage.removeItem('lastMidnightReset');
                    
                    // Reset state
                    setSectors(INITIAL_SECTORS);
                    setStats([]);
                    setTheme('light');
                    
                    // Force reload
                    window.location.reload();
                  }
                }}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 hover:shadow-lg transition-all hover:scale-105 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                🗑️
              </button>
            </Tooltip>
            
            <Tooltip text={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all hover:scale-105"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalTasks}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{completedTasks}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {todayStat ? `${todayStat.productivityScore}%` : '--'}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Productivity</div>
          </div>
        </div>

        {/* What to Focus on Now */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">What to Focus on Now</h2>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Current Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          
          {currentSector ? (() => {
            const completedSectorTasks = currentSector.tasks.filter(t => t.completed).length;
            const totalSectorTasks = currentSector.tasks.length;
            const completionRate = totalSectorTasks > 0 ? Math.round((completedSectorTasks / totalSectorTasks) * 100) : 0;
            
            return (
              <div className={`rounded-3xl p-6 border transition-all ${
                currentSector.color === 'amber' ? 'border-amber-500/30 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30' :
                currentSector.color === 'blue' ? 'border-blue-500/30 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30' :
                currentSector.color === 'emerald' ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30' :
                currentSector.color === 'cyan' ? 'border-cyan-500/30 bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30' :
                currentSector.color === 'violet' ? 'border-violet-500/30 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30' :
                currentSector.color === 'indigo' ? 'border-indigo-500/30 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30' :
                currentSector.color === 'purple' ? 'border-purple-500/30 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30' :
                'border-slate-500/30 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl p-4 rounded-2xl ${
                      currentSector.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/40' :
                      currentSector.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40' :
                      currentSector.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/40' :
                      currentSector.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-900/40' :
                      currentSector.color === 'violet' ? 'bg-violet-100 dark:bg-violet-900/40' :
                      currentSector.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/40' :
                      currentSector.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/40' :
                      'bg-slate-100 dark:bg-slate-900/40'
                    }`}>
                      {currentSector.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{currentSector.label}</h3>
                        <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-sm font-medium">
                          ⏰ {currentSector.idealTime}
                        </span>
                      </div>
                      <p className="text-lg text-slate-700 dark:text-slate-300">{currentSector.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {completionRate}%
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {completedSectorTasks}/{totalSectorTasks} tasks
                    </div>
                  </div>
                </div>
                
                {totalSectorTasks > 0 && (
                  <div className="mt-6">
                    <div className="h-3 bg-white/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          currentSector.color === 'amber' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                          currentSector.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                          currentSector.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                          currentSector.color === 'cyan' ? 'bg-gradient-to-r from-cyan-500 to-sky-500' :
                          currentSector.color === 'violet' ? 'bg-gradient-to-r from-violet-500 to-purple-500' :
                          currentSector.color === 'indigo' ? 'bg-gradient-to-r from-indigo-500 to-blue-500' :
                          currentSector.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                          'bg-gradient-to-r from-slate-500 to-gray-500'
                        }`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })() : (
            <div className="text-center py-8 text-slate-500 italic">
              No focus area found for current time
            </div>
          )}
        </div>

        {/* Focus Sectors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sectors.map(sector => (
            <SectorCard
              key={sector.id}
              sector={sector}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onUpdateSector={handleUpdateSector}
            />
          ))}
        </div>

        {/* Quick Add Button */}
        <div className="fixed bottom-8 right-8 z-40">
          <Tooltip text="Daily Review">
            <button
              onClick={() => setShowDailyReview(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            >
              ✏️
            </button>
          </Tooltip>
        </div>
      </main>

      {/* Stats Panel */}
      {showStats && todayStat && (
        <StatsPanel
          stats={stats}
          sectors={sectors}
          currentHour={new Date().getHours()}
          onClose={() => setShowStats(false)}
        />
      )}

      {showDailyReview && todayStat && (
        <DailyReview
          stats={todayStat}
          onSave={handleSaveDailyReview}
          onClose={() => setShowDailyReview(false)}
        />
      )}
    </div>
  );
};

export default App;