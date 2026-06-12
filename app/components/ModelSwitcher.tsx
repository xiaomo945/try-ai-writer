'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useUsage, type ModelType } from '@/lib/usage';

const MODEL_INFO: Record<Exclude<ModelType, 'mock'>, { name: string; color: string; textColor: string; bgColor: string }> = {
  claude: { name: 'Claude', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-100' },
  deepseek: { name: 'DeepSeek', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-100' },
};

interface ModelOption {
  model: ModelType;
  label: string;
  isProOnly?: boolean;
}

const MODEL_OPTIONS: ModelOption[] = [
  { model: 'deepseek', label: 'DeepSeek' },
  { model: 'claude', label: 'Claude', isProOnly: true },
];

interface ModelSwitcherProps {
  onModelSwitch?: (model: ModelType) => void;
}

export function ModelSwitcher({ onModelSwitch }: ModelSwitcherProps) {
  const { selectedModel, setSelectedModel, isProUser } = useUsage();
  const [isOpen, setIsOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradePromptShown, setUpgradePromptShown] = useState(false);
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
    if (isProOnly && !isProUser) {
      if (!upgradePromptShown) {
        setShowUpgradePrompt(true);
        setUpgradePromptShown(true);
        setIsOpen(false);
        return;
      }
      return;
    }
    setSelectedModel(model);
    setIsOpen(false);
    if (onModelSwitch) {
      onModelSwitch(model);
    }
  };

  const currentModelInfo = MODEL_INFO[selectedModel as Exclude<ModelType, 'mock'>];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current model: ${currentModelInfo.name}. Click to switch.`}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors min-h-[44px]"
      >
        <div className={`w-3 h-3 rounded-full ${currentModelInfo.color}`} />
        <span className="text-sm font-medium text-slate-700">{currentModelInfo.name}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div role="listbox" aria-label="Available models" className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-slate-200 dark:border-white/10 z-50">
          <div className="py-1">
            {MODEL_OPTIONS.map((option) => {
              const isSelected = selectedModel === option.model;
              const isDisabled = option.isProOnly && !isProUser;
              const modelInfo = MODEL_INFO[option.model as Exclude<ModelType, 'mock'>];

              return (
                <button
                  key={option.model}
                  onClick={() => handleSelectModel(option.model, !!option.isProOnly)}
                  disabled={isDisabled}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors min-h-[44px] ${
                    isDisabled 
                      ? 'text-slate-400 cursor-not-allowed' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                  } ${isSelected ? 'bg-slate-50 dark:bg-white/5' : ''}`}
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

      {showUpgradePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowUpgradePrompt(false)}>
          <div className="glass-card p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-display font-extrabold text-white mb-2">
                Unlock Claude-Powered Writing
              </h2>
              <p className="text-slate-400">
                Claude Sonnet 4.6 delivers superior writing quality, especially for long-form content.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/pricing" className="btn-primary text-center min-h-[44px] flex items-center justify-center">
                🚀 Upgrade to Pro — $9/month
              </Link>
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="btn-outline text-center min-h-[44px] flex items-center justify-center"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
