import React, { useState } from 'react';
import { FocusSector, Task, Priority } from '../types';
import { ICONS, PRIORITY_COLORS, PRIORITY_LABELS } from '../constants';
import TaskForm from './TaskForm';
import Tooltip from './Tooltip';

interface SectorCardProps {
  sector: FocusSector;
  onAddTask: (sectorId: string, taskData: Partial<Task>) => void;
  onUpdateTask: (sectorId: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (sectorId: string, taskId: string) => void;
  onUpdateSector: (sectorId: string, updates: Partial<FocusSector>) => void;
}

const SectorCard: React.FC<SectorCardProps> = ({ 
  sector, 
  onAddTask, 
  onUpdateTask,
  onDeleteTask,
  onUpdateSector
}) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isEditingSector, setIsEditingSector] = useState(false);
  const [sectorName, setSectorName] = useState(sector.label);
  const [sectorDescription, setSectorDescription] = useState(sector.description);

  const handleAddTask = (sectorId: string, taskData: Partial<Task>) => {
    const fullTask: Task = {
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
    onAddTask(sectorId, fullTask);
  };

  const handleSaveSector = () => {
    onUpdateSector(sector.id, {
      label: sectorName,
      description: sectorDescription
    });
    setIsEditingSector(false);
  };

  const getPriorityCount = (priority: Priority) => {
    return sector.tasks.filter(t => t.priority === priority).length;
  };

  const completedTasks = sector.tasks.filter(t => t.completed).length;
  const completionRate = sector.tasks.length > 0 ? Math.round((completedTasks / sector.tasks.length) * 100) : 0;

  // حل مشكلة الديناميك كلاسز في Tailwind
  const colorClasses: Record<string, string> = {
    amber: 'border-amber-500/20 bg-amber-50/30 dark:bg-amber-950/10',
    blue: 'border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/10',
    emerald: 'border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10',
    cyan: 'border-cyan-500/20 bg-cyan-50/30 dark:bg-cyan-950/10',
    violet: 'border-violet-500/20 bg-violet-50/30 dark:bg-violet-950/10',
    slate: 'border-slate-500/20 bg-slate-50/30 dark:bg-slate-950/10',
    indigo: 'border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/10',
    purple: 'border-purple-500/20 bg-purple-50/30 dark:bg-purple-950/10',
    pink: 'border-pink-500/20 bg-pink-50/30 dark:bg-pink-950/10',
    green: 'border-green-500/20 bg-green-50/30 dark:bg-green-950/10'
  };

  const accentColors: Record<string, string> = {
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    cyan: 'bg-cyan-500',
    violet: 'bg-violet-500',
    slate: 'bg-slate-500',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    green: 'bg-green-500'
  };

  return (
    <>
      <div className={`rounded-lg sm:rounded-xl border p-3 sm:p-4 transition-all ${colorClasses[sector.color] || colorClasses.blue}`}>
        
        {/* Sector Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className={`text-xl sm:text-2xl p-2 sm:p-2.5 rounded-lg ${
              sector.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' : 
              sector.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
              sector.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
              sector.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-900/30' :
              sector.color === 'violet' ? 'bg-violet-100 dark:bg-violet-900/30' :
              sector.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
              sector.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
              sector.color === 'pink' ? 'bg-pink-100 dark:bg-pink-900/30' :
              sector.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
              'bg-slate-100 dark:bg-slate-900/30'
            } shrink-0`}>
              {sector.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {sector.label}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                {sector.description}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  ⏰ {sector.idealTime}
                </span>
                <span className="text-xs bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  📊 {completionRate}% Complete
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 justify-end mt-2 sm:mt-0">
            <Tooltip text="Add Task">
              <button
                onClick={() => setShowTaskForm(true)}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-white hover:opacity-90 transition-colors ${
                  accentColors[sector.color] || accentColors.blue
                }`}
                aria-label="Add Task"
              >
                <ICONS.Plus />
              </button>
            </Tooltip>
            
            <Tooltip text="Edit Focus Area">
              <button 
                onClick={() => setIsEditingSector(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                aria-label="Edit Focus Area"
              >
                <ICONS.Edit />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Priority Overview */}
        <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {(['urgent', 'important', 'normal'] as Priority[]).map(priority => (
            <div key={priority} className={`flex-1 p-1.5 sm:p-2 rounded-lg ${PRIORITY_COLORS[priority]} bg-opacity-10`}>
              <div className="text-center">
                <div className="font-bold text-base sm:text-lg">{getPriorityCount(priority)}</div>
                <div className="text-xs">{PRIORITY_LABELS[priority]}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-2 sm:space-y-2.5">
          {sector.tasks.length === 0 ? (
            <div className="text-center py-4 text-slate-500 italic text-sm">
              No tasks yet. Add your first task to this focus area.
            </div>
          ) : (
            sector.tasks.map(task => (
              <div key={task.id} className="bg-white dark:bg-slate-800/50 rounded-lg p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <button
                      onClick={() => onUpdateTask(sector.id, task.id, { completed: !task.completed })}
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        task.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {task.completed && <ICONS.Check />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <span className={`font-medium text-sm sm:text-base ${task.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                        {task.text}
                      </span>
                      {task.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <Tooltip text="Delete Task">
                      <button
                        onClick={() => onDeleteTask(sector.id, task.id)}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        aria-label="Delete Task"
                      >
                        <ICONS.Trash />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sector Footer */}
        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between text-xs sm:text-sm">
            <div>
              <span className="font-semibold">{sector.tasks.length}</span> tasks
            </div>
            <div>
              <span className="font-semibold">{completedTasks}</span> completed
            </div>
            <div>
              <span className="font-semibold">{completionRate}%</span> completion rate
            </div>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          sectorId={sector.id}
          onAddTask={handleAddTask}
          onClose={() => setShowTaskForm(false)}
        />
      )}

      {/* Edit Sector Modal */}
      {isEditingSector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl max-w-full w-full max-w-md mx-auto p-4 sm:p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base sm:text-lg font-bold mb-3">Edit Focus Area</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  className="w-full p-2.5 sm:p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-sm sm:text-base"
                  placeholder="e.g., Creative Flow"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={sectorDescription}
                  onChange={(e) => setSectorDescription(e.target.value)}
                  className="w-full p-2.5 sm:p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-sm sm:text-base"
                  rows={2}
                  placeholder="e.g., Brainstorming, design, innovation"
                />
              </div>
              
              <div className="flex gap-2 sm:gap-3 pt-2">
                <button
                  onClick={() => setIsEditingSector(false)}
                  className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSector}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SectorCard;