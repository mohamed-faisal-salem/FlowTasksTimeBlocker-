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

// إضافة في بداية App component
useEffect(() => {
  console.log('🔄 Stats from localStorage:', 
    JSON.parse(localStorage.getItem('daily-stats') || '[]')
  );
  console.log('🔄 Sectors from localStorage:', 
    JSON.parse(localStorage.getItem('daily-task-sectors') || '[]')
  );
}, []);

  // Auto-reset at midnight (12 AM)
// في App.tsx - استبدل useEffect الحالي بالكود التالي:

useEffect(() => {
  const checkForReset = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const today = new Date().toISOString().split('T')[0];
    
    // ✅ التحقق من الوقت (12:00 - 12:05 صباحاً)
    if (hours === 9 && minutes >= 45 && minutes <= 49) {
      const lastReset = localStorage.getItem('lastMidnightReset');
      
      // ✅ إذا لم يتم الـ Reset اليوم أو كان آخر reset يوم أمس
      if (!lastReset || lastReset !== today) {
        console.log('🔄 Starting daily reset at midnight...');
        
        // 1. مسح المهام فقط
        setSectors(prevSectors => 
          prevSectors.map(sector => ({
            ...sector,
            tasks: [] // مسح المهام فقط
          }))
        );
        
        // 2. تحديث الإحصائيات لليوم الجديد
        setStats(prevStats => {
          // إنشاء إحصائيات جديدة لليوم
          const newStats = calculateDailyStats(sectors.map(s => ({...s, tasks: []})));
          const newDailyStat = {
            ...newStats,
            date: today,
            dailyRating: undefined,
            notes: undefined,
            streak: 0
          };
          
          // إزالة إحصائيات اليوم السابق إذا كانت موجودة
          const filteredStats = prevStats.filter(stat => stat.date !== today);
          
          return [...filteredStats, newDailyStat];
        });
        
        // 3. حفظ تاريخ الـ Reset
        localStorage.setItem('lastMidnightReset', today);
        console.log('✅ Daily reset completed at midnight');
        
        // 4. إعادة تحميل الصفحة للتأكد من التحديث
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  };
  
  // تحقق كل دقيقة
  const interval = setInterval(checkForReset, 60000);
  checkForReset(); // تحقق فور التحميل
  
  return () => clearInterval(interval);
}, [setSectors, setStats]);

  // Update theme
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  // Update stats when tasks change
// في App.tsx - إصلاح useEffect الأول
useEffect(() => {
  // ✅ احسب الإحصائيات أولاً
  const todayStats = calculateDailyStats(sectors);
  
  // ✅ استخدم setStats مع دالة updater لتجنب dependency على stats
  setStats(prevStats => {
    const existingStatIndex = prevStats.findIndex(s => s.date === currentDate);
    
    if (existingStatIndex >= 0) {
      // تحديث الإحصائيات الموجودة
      const updatedStats = [...prevStats];
      updatedStats[existingStatIndex] = {
        ...updatedStats[existingStatIndex],
        ...todayStats
      };
      return updatedStats;
    } else {
      // إضافة إحصائيات جديدة
      return [...prevStats, todayStats];
    }
  });
}, [sectors, currentDate]); // ⚠️ إزالة stats و setStats من dependencies


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

// في App.tsx - تصحيح دالة handleSaveDailyReview
const handleSaveDailyReview = (rating: number, notes: string) => {
  // استخدام setStats مباشرة لتحديث الحالة
  setStats(prevStats => {
    const existingStatIndex = prevStats.findIndex(s => s.date === currentDate);
    
    if (existingStatIndex >= 0) {
      // تحديث الإحصائيات الموجودة
      const updatedStats = [...prevStats];
      updatedStats[existingStatIndex] = {
        ...updatedStats[existingStatIndex],
        dailyRating: rating,
        notes: notes.trim() || undefined
      };
      return updatedStats;
    } else {
      // أو أنشئ إحصائيات جديدة لهذا اليوم
      const todayStats = calculateDailyStats(sectors);
      return [...prevStats, {
        ...todayStats,
        date: currentDate,
        dailyRating: rating,
        notes: notes.trim() || undefined
      }];
    }
  });
  
  // إغلاق الـ Review
  setShowDailyReview(false);
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
  <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-20 flex items-center justify-between">
    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md sm:shadow-lg shrink-0">
        📊
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white truncate">
          FlowTaskTimeBlocker
        </h1>
        {todayStat && (
          <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold text-xs whitespace-nowrap">
              {completedTasks}/{totalTasks} tasks
            </span>
            {todayStat.dailyRating && (
              <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-semibold text-xs whitespace-nowrap">
                ★ {todayStat.dailyRating}/10
              </span>
            )}
          </div>
        )}
      </div>
    </div>

    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
      <Tooltip text="Analytics Dashboard">
        <button 
          onClick={() => setShowStats(true)}
          className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md sm:hover:shadow-lg transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
          aria-label="Analytics Dashboard"
        >
          📈
        </button>
      </Tooltip>
      
      {/* Clear All Data Button */}
      <Tooltip text="Clear All Data (Reset Everything)">
        <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to clear ALL data?\n\nThis will delete:\n• All tasks\n• All statistics\n• All daily reviews\n• All focus area edits\n\nThis action cannot be undone!')) {
              
              // ✅ 1. إزالة event listeners أولاً
              window.removeEventListener('storage', () => {});
              
              // ✅ 2. مسح localStorage بالكامل
              localStorage.clear();
              
              // ✅ 3. إعادة تعيين state مباشرة
              setSectors(INITIAL_SECTORS);
              setStats([]);
              
              // ✅ 4. إعادة تعيين المتغيرات المحلية
              const newStats = calculateDailyStats(INITIAL_SECTORS);
              const today = new Date().toISOString().split('T')[0];
              
              // ✅ 5. حفظ القيم الافتراضية مباشرة في localStorage
              localStorage.setItem('daily-task-sectors', JSON.stringify(INITIAL_SECTORS));
              localStorage.setItem('daily-stats', JSON.stringify([{
                ...newStats,
                date: today,
                dailyRating: undefined,
                notes: undefined
              }]));
              localStorage.setItem('theme', JSON.stringify('light'));
              
              // ✅ 6. إعادة تحميل الصفحة للتأكد
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }
          }}
          className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 hover:shadow-md sm:hover:shadow-lg transition-all hover:scale-105 active:scale-95 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm sm:text-base"
          aria-label="Clear All Data"
        >
          🗑️
        </button>
      </Tooltip>
      
      <Tooltip text={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md sm:hover:shadow-lg transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
          aria-label="Toggle Theme"
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
<div className="mb-6 sm:mb-8">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
    <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
      What to Focus on Now
    </h2>
    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
      Current Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>
  
  {currentSector ? (() => {
    const completedSectorTasks = currentSector.tasks.filter(t => t.completed).length;
    const totalSectorTasks = currentSector.tasks.length;
    const completionRate = totalSectorTasks > 0 ? Math.round((completedSectorTasks / totalSectorTasks) * 100) : 0;
    
    return (
      <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border transition-all ${
        currentSector.color === 'amber' ? 'border-amber-500/30 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30' :
        currentSector.color === 'blue' ? 'border-blue-500/30 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30' :
        currentSector.color === 'emerald' ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30' :
        currentSector.color === 'cyan' ? 'border-cyan-500/30 bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30' :
        currentSector.color === 'violet' ? 'border-violet-500/30 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30' :
        currentSector.color === 'indigo' ? 'border-indigo-500/30 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30' :
        currentSector.color === 'purple' ? 'border-purple-500/30 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30' :
        'border-slate-500/30 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className={`text-2xl sm:text-4xl p-2.5 sm:p-4 rounded-lg sm:rounded-2xl ${
              currentSector.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/40' :
              currentSector.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40' :
              currentSector.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/40' :
              currentSector.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-900/40' :
              currentSector.color === 'violet' ? 'bg-violet-100 dark:bg-violet-900/40' :
              currentSector.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/40' :
              currentSector.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/40' :
              'bg-slate-100 dark:bg-slate-900/40'
            } shrink-0`}>
              {currentSector.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                  {currentSector.label}
                </h3>
                <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium whitespace-nowrap">
                  ⏰ {currentSector.idealTime}
                </span>
              </div>
              <p className="text-sm sm:text-lg text-slate-700 dark:text-slate-300 line-clamp-1 sm:line-clamp-none">
                {currentSector.description}
              </p>
            </div>
          </div>
          
          <div className="text-center sm:text-right mt-2 sm:mt-0 shrink-0">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-0.5">
              {completionRate}%
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
              {completedSectorTasks}/{totalSectorTasks} tasks
            </div>
          </div>
        </div>
        
        {totalSectorTasks > 0 && (
          <div className="mt-4 sm:mt-6">
            <div className="h-2 sm:h-3 bg-white/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
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
    <div className="text-center py-4 sm:py-8 text-slate-500 italic text-sm sm:text-base">
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
  <Tooltip text={todayStat?.dailyRating ? "View Daily Review" : "Daily Review"}>
    <button
      onClick={() => {
        // التأكد من وجود إحصائيات اليوم أولاً
        const existingStatIndex = stats.findIndex(s => s.date === currentDate);
        
        if (existingStatIndex >= 0) {
          // تحديث الحالة المحلية قبل فتح الـ Review
          setStats(prevStats => {
            const updatedStats = [...prevStats];
            if (updatedStats[existingStatIndex]) {
              updatedStats[existingStatIndex] = {
                ...updatedStats[existingStatIndex],
                // تحديث أي بيانات قد تكون مفقودة
                productivityScore: calculateDailyStats(sectors).productivityScore,
                completedTasks: sectors.reduce((sum, s) => 
                  sum + s.tasks.filter(t => t.completed).length, 0
                ),
                totalTasks: sectors.reduce((sum, s) => sum + s.tasks.length, 0)
              };
            }
            return updatedStats;
          });
        } else {
          // إذا لم توجد إحصائيات، أنشئها
          const newStats = calculateDailyStats(sectors);
          setStats(prev => [...prev, { ...newStats, date: currentDate }]);
        }
        
        // ثم افتح الـ Review بعد تحديث الحالة
        setTimeout(() => {
          setShowDailyReview(true);
        }, 50);
      }}
      className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform relative"
    >
      {todayStat?.dailyRating ? (
        <>
          📊
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full text-xs flex items-center justify-center">
            ✓
          </span>
        </>
      ) : (
        '📝'
      )}
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

      {showDailyReview && (
        <DailyReview
          stats={todayStat || { ...calculateDailyStats(sectors), date: currentDate }}
          onSave={handleSaveDailyReview}
          onClose={() => setShowDailyReview(false)}
        />
      )}
    </div>
  );
};

export default App;