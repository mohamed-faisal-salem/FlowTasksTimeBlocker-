// types.ts - إزالة الأنواع غير الضرورية
export type Priority = 'urgent' | 'important' | 'normal';

export type TimeBlockId = 'sleep' | 'morning' | 'focus' | 'reset' | 'afternoon' | 'evening' | 'night';

export interface TimeBlock {
  id: TimeBlockId;
  startHour: number;
  endHour: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: Priority;
  progress: number;
  estimatedTime: number;
  timeSpent: number;
  dueDate?: string;
  notes?: string;
}

export interface FocusSector {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  tasks: Task[];
  idealTime: string;
}

export interface DailyStats {
  id: string;
  date: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalEstimatedTime: number;
  totalTimeSpent: number;
  efficiencyRate: number;
  priorityDistribution: { [key in Priority]: number };
  focusTime: { [sectorId: string]: number };
  productivityScore: number;
  dailyRating?: number;
  notes?: string;
  streak: number;
  completionRate: number;
  vibeScore: number;
  energyFlow: Record<TimeBlockId, number>;
  peakHour: number;
}