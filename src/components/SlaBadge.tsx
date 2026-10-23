import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Priority, TicketStatus } from '../types';

interface SlaBadgeProps {
  deadline: string;
  priority: Priority;
  status: TicketStatus;
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({ deadline, priority, status }) => {
  const [timeLeft, setTimeLeft] = useState<{ diffMs: number; text: string; isOverdue: boolean; isWarning: boolean }>({
    diffMs: 0,
    text: '',
    isOverdue: false,
    isWarning: false,
  });

  useEffect(() => {
    const update = () => {
      if (status === 'DA_NGHIEM_THU') {
        setTimeLeft({ diffMs: 0, text: 'Đúng hạn SLA', isOverdue: false, isWarning: false });
        return;
      }

      const now = Date.now();
      const target = new Date(deadline).getTime();
      const diffMs = target - now;

      if (diffMs <= 0) {
        const overMin = Math.abs(Math.floor(diffMs / (1000 * 60)));
        const hours = Math.floor(overMin / 60);
        const mins = overMin % 60;
        setTimeLeft({
          diffMs,
          text: `Quá hạn ${hours > 0 ? `${hours}h ` : ''}${mins}m`,
          isOverdue: true,
          isWarning: false,
        });
      } else {
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const isWarning = totalMinutes <= 30;
        setTimeLeft({
          diffMs,
          text: `Còn ${hours > 0 ? `${hours}h ` : ''}${mins}m`,
          isOverdue: false,
          isWarning,
        });
      }
    };

    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [deadline, status]);

  if (status === 'DA_NGHIEM_THU') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đúng hạn SLA
      </span>
    );
  }

  if (timeLeft.isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
        <AlertTriangle className="w-3 h-3 text-rose-600" /> {timeLeft.text}
      </span>
    );
  }

  if (timeLeft.isWarning) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
        <Clock className="w-3 h-3 text-amber-600" /> {timeLeft.text}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
      <Clock className="w-3 h-3 text-slate-500" /> {timeLeft.text}
    </span>
  );
};
