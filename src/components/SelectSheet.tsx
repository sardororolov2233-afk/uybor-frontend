import React from 'react';
import { X } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: SelectOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export const SelectSheet: React.FC<SelectSheetProps> = ({
  isOpen, onClose, title, options, selectedValue, onSelect
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="relative bg-white rounded-t-[24px] w-full max-h-[75vh] flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-600 active:scale-95 transition-transform">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 pb-safe-bottom">
          {options.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onSelect(opt.value);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-colors mb-1 ${
                  isSelected ? 'bg-blue-50/50 text-[#0066b2] font-bold' : 'text-gray-700 active:bg-gray-50'
                }`}
              >
                <span className="text-[15px]">{opt.label}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-[#0066b2]' : 'border-gray-300'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#0066b2]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
