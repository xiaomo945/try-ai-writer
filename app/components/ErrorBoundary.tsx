'use client';

import React, { Component, ReactNode } from 'react';
import { ErrorState } from './ErrorState';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 检测是否是 DOM 相关错误（浏览器翻译可能导致的）
    const isDomError = 
      error.message.includes('getBoundingClientRect') ||
      error.message.includes('classList') ||
      error.message.includes('style') ||
      error.message.includes('isConnected') ||
      error.message.includes('MutationObserver') ||
      error.message.includes('IntersectionObserver') ||
      error.message.includes('insertBefore') ||
      error.message.includes('removeChild') ||
      error.message.includes('appendChild') ||
      error.message.includes('NotFoundError') ||
      error.message.includes('HierarchyRequestError');
    
    if (isDomError) {
      console.warn('[ErrorBoundary] Detected potential DOM mutation error (possibly from browser translation)');
    }
    
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // 根据错误类型显示不同的信息
      const isTranslationError = 
        this.state.error?.message.includes('classList') ||
        this.state.error?.message.includes('style') ||
        this.state.error?.message.includes('getBoundingClientRect') ||
        this.state.error?.message.includes('insertBefore') ||
        this.state.error?.message.includes('removeChild') ||
        this.state.error?.message.includes('NotFoundError');
      
      const title = isTranslationError 
        ? "Page temporarily unavailable" 
        : "Something went wrong";
      
      const message = isTranslationError
        ? "It looks like your browser's translation feature may have caused an issue. Try disabling translation and reloading the page."
        : (this.state.error?.message || "We encountered an unexpected error. Please try reloading the page.");

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
          <ErrorState
            title={title}
            message={message}
            onRetry={this.handleReload}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
