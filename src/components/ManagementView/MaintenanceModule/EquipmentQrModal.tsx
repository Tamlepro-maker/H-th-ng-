import React from 'react';
import { X, QrCode, ShieldCheck, Printer, Check, Copy } from 'lucide-react';
import { EquipmentItem } from '../../../types';

interface EquipmentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: EquipmentItem;
}

export const EquipmentQrModal: React.FC<EquipmentQrModalProps> = ({
  isOpen,
  onClose,
  equipment,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(equipment.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 text-left">
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold">Mã QR Định Danh Thiết Bị</h4>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Card Body */}
        <div className="p-4 flex flex-col items-center text-center space-y-3">
          
          {/* Simulated High-Res QR Code frame */}
          <div className="p-3 bg-white border-2 border-dashed border-cyan-500/50 rounded-2xl shadow-sm relative group">
            {/* SVG QR Code Pattern */}
            <svg
              className="w-40 h-40 text-slate-900"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Outer corners */}
              <rect x="5" y="5" width="26" height="26" rx="4" fill="currentColor" />
              <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
              <rect x="13" y="13" width="10" height="10" rx="1" fill="currentColor" />

              <rect x="69" y="5" width="26" height="26" rx="4" fill="currentColor" />
              <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
              <rect x="77" y="13" width="10" height="10" rx="1" fill="currentColor" />

              <rect x="5" y="69" width="26" height="26" rx="4" fill="currentColor" />
              <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
              <rect x="13" y="77" width="10" height="10" rx="1" fill="currentColor" />

              {/* Data blocks */}
              <rect x="36" y="8" width="8" height="8" />
              <rect x="48" y="8" width="6" height="14" />
              <rect x="58" y="14" width="6" height="6" />
              <rect x="36" y="24" width="14" height="6" />
              
              <rect x="8" y="38" width="8" height="8" />
              <rect x="20" y="44" width="6" height="12" />
              <rect x="8" y="52" width="6" height="6" />
              
              <rect x="34" y="34" width="12" height="12" fill="#0891b2" />
              <rect x="54" y="36" width="10" height="6" />
              <rect x="70" y="36" width="6" height="14" />
              <rect x="82" y="36" width="10" height="8" />
              <rect x="48" y="48" width="14" height="6" />
              <rect x="70" y="56" width="8" height="16" />
              <rect x="84" y="50" width="8" height="8" />

              <rect x="36" y="68" width="8" height="12" />
              <rect x="48" y="64" width="14" height="6" />
              <rect x="48" y="76" width="8" height="16" />
              <rect x="62" y="78" width="12" height="6" />
              <rect x="80" y="80" width="12" height="12" fill="#0891b2" />
            </svg>
            
            <div className="absolute inset-x-0 bottom-1 flex justify-center">
              <span className="text-[9px] font-mono font-bold bg-white/95 px-2 py-0.5 rounded shadow-2xs border border-slate-200 text-slate-800">
                {equipment.code}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <h5 className="font-bold text-xs text-slate-900">{equipment.name}</h5>
            <p className="text-[10px] text-slate-500">{equipment.location}</p>
            <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                Chu kỳ: {equipment.cycle}
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
                {equipment.category}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex items-center gap-2 pt-1">
            <button
              onClick={handleCopyCode}
              className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-200 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép mã' : 'Sao chép mã'}</span>
            </button>
            <button
              onClick={() => alert(`Mô phỏng in nhãn QR dán thiết bị [${equipment.code}]`)}
              className="flex-1 py-1.5 px-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In nhãn dán</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
