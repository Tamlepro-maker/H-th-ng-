import React, { useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  notification: AppNotification | null;
  onDismiss: () => void;
  onOpenTicket?: (ticketId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onOpenTicket,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const icons = {
    INFO: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
    SUCCESS: <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />,
    WARNING: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    ALERT: <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />,
  };

  return (
    <div className="absolute top-12 left-3 right-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div 
        onClick={() => {
          if (notification.ticketId && onOpenTicket) {
            onOpenTicket(notification.ticketId);
            onDismiss();
          }
        }}
        className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-3 flex items-start gap-3 text-left cursor-pointer hover:border-blue-400 transition-all group ring-1 ring-black/5"
      >
        <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 mt-0.5">
          {icons[notification.type] || <Bell className="w-4 h-4 text-blue-600" />}
        </div>
        
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 truncate">{notification.title}</h4>
            <span className="text-[10px] text-slate-400 ml-2">Vừa xong</span>
          </div>
          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
            {notification.message}
          </p>
          {notification.ticketId && (
            <span className="inline-block mt-1 text-[10px] text-blue-600 font-semibold group-hover:underline">
              Chạm để xem chi tiết →
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          title="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
