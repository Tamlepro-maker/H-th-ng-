import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, Battery, Signal, Smartphone, Maximize2 } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  activeRoleLabel: string;
}

const BASE_WIDTH = 400;
const BASE_HEIGHT = 838; // 400 * (163.4 / 78.0) = 837.95px (~838px)

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, activeRoleLabel }) => {
  const [time, setTime] = useState('09:41');
  const [isAutoFit, setIsAutoFit] = useState(true);
  const [scale, setScale] = useState<number>(0.84);

  const calculateFitScale = useCallback(() => {
    if (typeof window === 'undefined') return 0.84;
    // Account for top role switcher bar (~52px), margin and frame controls (~38px)
    const availableHeight = window.innerHeight - 105;
    const computed = Math.min(1.0, Math.max(0.60, availableHeight / BASE_HEIGHT));
    return Number(computed.toFixed(2));
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isAutoFit) return;
    const handleResize = () => {
      setScale(calculateFitScale());
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAutoFit, calculateFitScale]);

  return (
    <div className="flex flex-col items-center justify-center select-none w-full">
      {/* Quick frame scale controls */}
      <div className="flex items-center gap-1.5 mb-1.5 text-xs text-slate-400">
        <span className="flex items-center gap-1 font-medium text-slate-300 text-[11px]">
          <Smartphone className="w-3 h-3 text-blue-400" /> Chuẩn 163,4 × 78,0 mm:
        </span>

        <button
          onClick={() => {
            setIsAutoFit(true);
            setScale(calculateFitScale());
          }}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
            isAutoFit ? 'bg-blue-600 text-white font-bold shadow-xs' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Tự động thu phóng vừa vặn toàn màn hình không cần cuộn trang"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Vừa khít màn hình ({Math.round(scale * 100)}%)</span>
        </button>

        <button
          onClick={() => {
            setIsAutoFit(false);
            setScale(0.75);
          }}
          className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
            !isAutoFit && scale === 0.75 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Thu nhỏ 75%"
        >
          75%
        </button>

        <button
          onClick={() => {
            setIsAutoFit(false);
            setScale(0.85);
          }}
          className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
            !isAutoFit && scale === 0.85 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="85%"
        >
          85%
        </button>

        <button
          onClick={() => {
            setIsAutoFit(false);
            setScale(1);
          }}
          className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
            !isAutoFit && scale === 1 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Kích thước gốc 100%"
        >
          100%
        </button>

        <span className="text-[10px] text-slate-400 ml-1.5 hidden md:inline">
          • Đang xem: <strong className="text-blue-400">{activeRoleLabel}</strong>
        </span>
      </div>

      {/* Outer bounding box matching scaled dimensions so parent NEVER overflows or causes window scroll */}
      <div
        style={{
          width: BASE_WIDTH * scale,
          height: BASE_HEIGHT * scale,
        }}
        className="relative overflow-visible shrink-0 transition-all duration-200"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
          }}
          className="absolute top-0 left-0 transition-transform duration-200"
        >
          {/* Titanium Outer Rim: 400px x 838px matching 163.4 / 78.0 mm */}
          <div className="relative w-[400px] h-[838px] bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 rounded-[50px] p-[9px] shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_20px_50px_-10px_rgba(0,0,0,0.5),0_0_40px_rgba(59,130,246,0.12)] ring-1 ring-slate-400/40 flex flex-col">
            
            {/* Hardware buttons accents (Volume & Power) */}
            <div className="absolute -left-[12px] top-[110px] w-[3px] h-[32px] bg-slate-400 rounded-l-md" />
            <div className="absolute -left-[12px] top-[155px] w-[3px] h-[50px] bg-slate-400 rounded-l-md" />
            <div className="absolute -left-[12px] top-[215px] w-[3px] h-[50px] bg-slate-400 rounded-l-md" />
            <div className="absolute -right-[12px] top-[160px] w-[3px] h-[65px] bg-slate-400 rounded-r-md" />

            {/* Inner Light Screen Viewport (Bright Mode) */}
            <div className="relative w-full h-full bg-slate-50 text-slate-900 rounded-[42px] overflow-hidden flex flex-col border border-slate-300/80 shadow-inner">
              
              {/* iOS Status Bar (Light Screen Theme) */}
              <div className="h-10 px-6 pt-1.5 flex items-center justify-between text-xs text-slate-800 shrink-0 z-30 bg-slate-50/90 backdrop-blur-md select-none">
                <span className="font-bold text-xs tracking-tight text-slate-900">{time}</span>

                {/* iPhone Dynamic Island */}
                <div className="w-28 h-5 bg-black rounded-full flex items-center justify-between px-2 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                  <div className="w-2 h-2 rounded-full bg-blue-500/80 animate-pulse" />
                </div>

                <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4 fill-slate-800 text-slate-800" />
                </div>
              </div>

              {/* Screen Viewport: Children render here */}
              <div className="relative flex-1 w-full overflow-hidden flex flex-col bg-slate-50 text-slate-900">
                {children}
              </div>

              {/* iOS Home Indicator Bar */}
              <div className="h-3.5 w-full flex items-center justify-center shrink-0 bg-white z-30 select-none pb-0.5 border-t border-slate-100">
                <div className="w-28 h-1 bg-slate-400/80 rounded-full" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
