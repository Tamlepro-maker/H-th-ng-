import React from 'react';
import { TicketStatus, Priority, PropertyScope } from '../types';

export const StatusBadge: React.FC<{ status: TicketStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const configs: Record<TicketStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
    CHO_DUYET: {
      label: 'Chờ duyệt',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    DANG_XU_LY: {
      label: 'Đang xử lý',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
    },
    CHO_NGHIEM_THU: {
      label: 'Chờ nghiệm thu',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      dot: 'bg-purple-500',
    },
    CHO_XAC_MINH_KHIEU_NAI: {
      label: 'Chờ xác minh khiếu nại',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-300',
      dot: 'bg-rose-500',
    },
    DA_NGHIEM_THU: {
      label: 'Đã nghiệm thu',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
    YEU_CAU_LAM_LAI: {
      label: 'Sửa chữa lại',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      dot: 'bg-orange-500',
    },
  };

  const c = configs[status] || configs.CHO_DUYET;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${c.bg} ${c.text} ${c.border} ${sizeClasses} shadow-xs`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
      {c.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  if (priority === 'P1') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
        P1 - Khẩn cấp (2h)
      </span>
    );
  }
  if (priority === 'P2') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
        P2 - Cần sớm (6h)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
      P3 - Tiêu chuẩn (24h)
    </span>
  );
};

export const ScopeBadge: React.FC<{ scope: PropertyScope }> = ({ scope }) => {
  if (scope === 'SO_HUU_CHUNG') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
        Sở hữu chung
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
      Sở hữu riêng
    </span>
  );
};
