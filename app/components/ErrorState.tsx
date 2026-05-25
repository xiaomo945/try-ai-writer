import React from 'react';
import Link from 'next/link';
import { CircleAlert } from 'lucide-react';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  onHome?: () => void;
}

export function ErrorState({ title, message, onRetry, onHome }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <CircleAlert className="w-10 h-10 text-red-600" />
      </div>
      <h3 className="text-2xl font-display font-extrabold text-red-600 dark:text-red-400 mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{message}</p>
      <div className="flex gap-4">
        {onRetry && (
          <button onClick={onRetry} className="btn-primary text-sm">
            重试
          </button>
        )}
        {onHome && (
          <Link href="/" className="btn-outline text-sm" onClick={onHome}>
            返回首页
          </Link>
        )}
        {!onHome && (
          <Link href="/" className="btn-outline text-sm">
            返回首页
          </Link>
        )}
      </div>
    </div>
  );
}
