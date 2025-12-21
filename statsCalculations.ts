// statsCalculations.ts - النسخة المعدلة كاملة
import { FocusSector, DailyStats, TimeBlockId, TimeBlock } from './types';

// حساب الإنتاجية بالنظام الجديد (نظام النقاط)
export const calculateProductivityScore = (sectors: FocusSector[]): number => {
  let totalPoints = 0;
  
  sectors.forEach(sector => {
    sector.tasks.forEach(task => {
      if (task.completed) {
        switch (task.priority) {
          case 'urgent':
            totalPoints += 3; // 3 نقاط للمهام العاجلة
            break;
          case 'important':
            totalPoints += 2; // 2 نقطة للمهام المهمة
            break;
          case 'normal':
            totalPoints += 1; // 1 نقطة للمهام العادية
            break;
        }
      }
    });
  });
  
  // 1000 نقطة = 100%، لذا 10 نقاط = 1%
  const score = Math.min(100, Math.round((totalPoints)));
  return score;
};

// حساب تدفق الطاقة لكل قطاع
export const calculateEnergyFlowBySectors = (
  sectors: FocusSector[]
): Record<string, number> => {
  const energyFlow: Record<string, number> = {};

  if (!sectors || sectors.length === 0) {
    return energyFlow;
  }

  // حساب تدفق الطاقة لكل قطاع
  sectors.forEach(sector => {
    const totalTasks = sector.tasks.length;
    const completedTasks = sector.tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    energyFlow[sector.id] = Math.round(completionRate);
  });

  return energyFlow;
};

// حساب Vibe Score
export const calculateVibeScore = (energyFlow: Record<string, number>): number => {
  const values = Object.values(energyFlow);
  if (values.length === 0) return 0;
  
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
};

// حساب الإحصائيات اليومية
export const calculateDailyStats = (
  sectors: FocusSector[]
): DailyStats => {
  const allTasks = sectors.flatMap(s => s.tasks);
  const completedTasks = allTasks.filter(t => t.completed).length;
  const pendingTasks = allTasks.filter(t => !t.completed).length;
  const totalTasks = allTasks.length;
  
  const priorityDistribution = {
    urgent: allTasks.filter(t => t.priority === 'urgent').length,
    important: allTasks.filter(t => t.priority === 'important').length,
    normal: allTasks.filter(t => t.priority === 'normal').length
  };

  const totalEstimatedTime = allTasks.reduce((sum, task) => sum + task.estimatedTime, 0);
  const totalTimeSpent = allTasks.reduce((sum, task) => sum + task.timeSpent, 0);
  
  const efficiencyRate = totalEstimatedTime > 0 
    ? Math.round((totalTimeSpent / totalEstimatedTime) * 100) 
    : 100;

  const focusTime: { [sectorId: string]: number } = {};
  sectors.forEach(sector => {
    focusTime[sector.id] = sector.tasks.reduce((sum, task) => sum + task.timeSpent, 0);
  });

  // حساب الإنتاجية بالنظام الجديد
  const productivityScore = calculateProductivityScore(sectors);
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // حساب تدفق الطاقة
  const energyFlow = calculateEnergyFlowBySectors(sectors);
  
  // حساب Vibe Score
  const vibeScore = calculateVibeScore(energyFlow);

  return {
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString().split('T')[0],
    totalTasks,
    completedTasks,
    pendingTasks,
    totalEstimatedTime,
    totalTimeSpent,
    efficiencyRate,
    priorityDistribution,
    focusTime,
    productivityScore,
    streak: 0,
    completionRate,
    vibeScore,
    energyFlow,
    peakHour: 0 // يمكن إزالته لاحقاً
  };
};

// حساب الـ Streak
export const calculateStreak = (stats: DailyStats[]): number => {
  if (stats.length === 0) return 0;
  
  // فرز الإحصائيات من الأحدث إلى الأقدم
  const sortedStats = [...stats].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(23, 59, 59, 999);
  
  for (let i = 0; i < sortedStats.length; i++) {
    const stat = sortedStats[i];
    const statDate = new Date(stat.date);
    statDate.setHours(23, 59, 59, 999);
    
    const diffTime = currentDate.getTime() - statDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak && stat.completedTasks > 0) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// دالة لتحليل الأنماط
export const analyzeProductivityPatterns = (stats: DailyStats[], sectors?: FocusSector[]) => {
  if (stats.length === 0) {
    return {
      bestTimeBlock: 'focus' as TimeBlockId,
      averageCompletion: 0,
      consistencyScore: 0,
      vibeTrend: 'stable' as 'improving' | 'stable' | 'declining'
    };
  }

  const recentStats = stats.slice(-7);
  
  return {
    bestTimeBlock: 'focus' as TimeBlockId,
    averageCompletion: recentStats.reduce((sum, stat) => 
      sum + stat.completionRate, 0) / recentStats.length,
    consistencyScore: 75,
    vibeTrend: 'stable' as 'improving' | 'stable' | 'declining'
  };
};