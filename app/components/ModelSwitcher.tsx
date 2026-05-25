'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useUsage, type ModelType, type UserPlan } from '@/lib/usage';

const MODEL_INFO = {
  claude: { name: 'Claude', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-100' },
  deepseek: { name: 'DeepSeek', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-100' },
  mock: { name: 'Mock', color: 'bg-slate-400', textColor: 'text-slate-700', bgColor: 'bg-slate-100' },
};

interface ModelOption {
  model: ModelType;
  label: string;
  isProOnly?: boolean;
}

const MODEL_OPTIONS: ModelOption[] = [
  { model: 'deepseek', label: 'DeepSeek' },
  { model: 'claude', label: 'Claude', isProOnly: true },
  { model: 'mock', label: 'Mock' },
];

export function ModelSwitcher() {
  const { selectedModel, setSelectedModel, isProUser } = useUsage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectModel = (model: ModelType, isProOnly: boolean) => {
    if (isProOnly && !isProUser) return;
    setSelectedModel(model);
    setIsOpen(false);
  };

  const currentModelInfo = MODEL_INFO[selectedModel];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors min-h-[44px]"
      >
        <div className={`w-3 h-3 rounded-full ${currentModelInfo.color}`} />
        <span className="text-sm font-medium text-slate-700">{currentModelInfo.name}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
          <div className="py-1">
            {MODEL_OPTIONS.map((option) => {
              const isSelected = selectedModel === option.model;
              const isDisabled = option.isProOnly && !isProUser;
              const modelInfo = MODEL_INFO[option.model];

              return (
                <button
                  key={option.model}
                  onClick={() => handleSelectModel(option.model, !!option.isProOnly)}
                  disabled={isDisabled}
                  className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
                    isDisabled 
                      ? 'text-slate-400 cursor-not-allowed' 
                      : 'text-slate-700 hover:bg-slate-100'
                  } ${isSelected ? 'bg-slate-50' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${modelInfo.color}`} />
                    <span className="text-sm">{option.label}</span>
                  </div>
                  {option.isProOnly && !isProUser && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      Pro 专属
                    </span>
                  )}
                  {isSelected && !isDisabled && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
