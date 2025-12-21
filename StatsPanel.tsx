import React, { useState } from 'react';
import { DailyStats, FocusSector } from './types';
import { calculateDailyStats, calculateStreak } from './statsCalculations';
import { ICONS } from './constants';

interface StatsPanelProps {
  stats: DailyStats[];
  sectors: FocusSector[];
  currentHour: number;
  onClose: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ 
  stats, 
  sectors, 
  onClose 
}) => {
  // حساب الإحصائيات الحالية
  const currentStats = calculateDailyStats(sectors);
  const currentStreak = calculateStreak(stats);
  
  const getBlockColor = (rate: number) => {
    if (rate >= 80) return 'text-emerald-500 bg-emerald-500/10';
    if (rate >= 50) return 'text-amber-500 bg-amber-500/10';
    return 'text-rose-500 bg-rose-500/10';
  };

  const getVibeMessage = (score: number) => {
    if (score >= 80) return "Perfect harmony across all focus areas! 🎵";
    if (score >= 60) return "Good balance in your focus areas ⚡";
    if (score >= 40) return "Room to improve focus distribution ⏰";
    return "Consider adjusting your focus areas 🔄";
  };

  // حساب إجمالي النقاط
  const calculateTotalPoints = () => {
    let totalPoints = 0;
    
    sectors.forEach(sector => {
      sector.tasks.forEach(task => {
        if (task.completed) {
          switch (task.priority) {
            case 'urgent':
              totalPoints += 3;
              break;
            case 'important':
              totalPoints += 2;
              break;
            case 'normal':
              totalPoints += 1;
              break;
          }
        }
      });
    });
    
    return totalPoints;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-3">
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl max-w-full w-full max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
        
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0">
              <ICONS.Target />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                Productivity Analytics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Based on your completed tasks
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 ml-2"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(90vh-120px)] sm:max-h-[60vh]">
          <div className="space-y-3 sm:space-y-4">
            {/* Vibe Score */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl sm:rounded-lg p-3 sm:p-4 border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 sm:mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-0.5">
                    Daily Vibe Score
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 sm:line-clamp-1">
                    {getVibeMessage(currentStats.vibeScore)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {currentStats.vibeScore}/100
                  </div>
                  <div className="text-xs text-slate-500">
                    Balance across focus areas
                  </div>
                </div>
              </div>
              <div className="h-1.5 sm:h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${currentStats.vibeScore}%` }}
                />
              </div>
            </div>

            {/* Productivity Score with Points */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-xl sm:rounded-lg p-3 sm:p-4 border border-emerald-100 dark:border-emerald-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 sm:mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-0.5">
                    <span>📈</span> 
                    <span className="truncate">Today's Productivity</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 sm:line-clamp-1">
                    Points system: Urgent=3, Important=2, Normal=1
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {currentStats.productivityScore}%
                  </div>
                  <div className="text-xs text-slate-500">
                    {calculateTotalPoints()}/1000 points
                  </div>
                </div>
              </div>
              <div className="h-1.5 sm:h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1 sm:mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000"
                  style={{ width: `${currentStats.productivityScore}%` }}
                />
              </div>
            </div>

            {/* Energy Flow by Focus Areas */}
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-1.5">
                <span>🌊</span> 
                <span className="truncate">Energy Flow by Focus Areas</span>
              </h3>
              <div className="space-y-2 sm:space-y-2.5">
                {sectors.map(sector => {
                  const rate = currentStats.energyFlow[sector.id] || 0;
                  const completed = sector.tasks.filter(t => t.completed).length;
                  const total = sector.tasks.length;
                  
                  return (
                    <div key={sector.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-slate-50/50 dark:bg-slate-900/50 gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                          <span className="text-base sm:text-lg shrink-0">{sector.icon}</span>
                          <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                            {sector.label}
                          </span>
                          <span className="text-xs text-slate-500 mono shrink-0 whitespace-nowrap ml-auto">
                            ⏰ {sector.idealTime}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {sector.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-sm sm:text-base font-bold ${getBlockColor(rate)} px-2 py-1 sm:px-3 sm:py-1 rounded-md sm:rounded-lg`}>
                          {rate}%
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">
                          {completed}/{total} tasks
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl sm:rounded-lg p-3 sm:p-4 border border-blue-100 dark:border-blue-900/50">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">Task Priority Distribution</h3>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                <div className="p-1.5 sm:p-2">
                  <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                    {currentStats.priorityDistribution.urgent}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Urgent (3 pts)</div>
                </div>
                <div className="p-1.5 sm:p-2">
                  <div className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
                    {currentStats.priorityDistribution.important}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Important (2 pts)</div>
                </div>
                <div className="p-1.5 sm:p-2">
                  <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                    {currentStats.priorityDistribution.normal}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Normal (1 pt)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
            The Time Blocker • Points: Urgent(3), Important(2), Normal(1) • 1000 pts = 100%
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;