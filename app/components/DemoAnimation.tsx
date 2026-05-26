'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Zap } from 'lucide-react';

type Step = 0 | 1 | 2 | 3;

export default function DemoAnimation() {
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  const questions = [
    "What's the tone you're going for? (e.g., fun, professional, mysterious)",
    "Who's your target audience for this novel?",
    "Any specific themes or emotions you want to highlight?"
  ];

  const generatedContent = `The morning sun painted the attic in gold,
dust motes dancing through the slanted rays.
Sarah ran her fingers over the old journal,
its leather cover worn smooth by time.
This was it — the story she'd been waiting for.`;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (currentStep === 1) {
      const fullText = "I want to write a novel about a time traveler who changes history for the better";
      if (typedText.length < fullText.length) {
        timeout = setTimeout(() => {
          setTypedText(fullText.slice(0, typedText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => setCurrentStep(2), 800);
      }
    } else if (currentStep === 0) {
      setTypedText('');
    } else if (currentStep === 2) {
      setTypedText("I want to write a novel about a time traveler who changes history for the better");
    }
    return () => clearTimeout(timeout);
  }, [currentStep, typedText]);

  useEffect(() => {
    let stepTimer: NodeJS.Timeout;
    let questionTimer: NodeJS.Timeout;

    if (currentStep === 0) {
      stepTimer = setTimeout(() => setCurrentStep(1), 1500);
    } else if (currentStep === 2) {
      if (questionIndex < questions.length - 1) {
        questionTimer = setTimeout(() => {
          setQuestionIndex(q => q + 1);
        }, 1500);
      } else {
        stepTimer = setTimeout(() => setCurrentStep(3), 2000);
      }
    } else if (currentStep === 3) {
      stepTimer = setTimeout(() => {
        setCurrentStep(0);
        setQuestionIndex(0);
        setTypedText('');
      }, 4000);
    }

    return () => {
      clearTimeout(stepTimer);
      clearTimeout(questionTimer);
    };
  }, [currentStep, questionIndex, questions.length]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(s => !s);
    }, 530);
    return () => clearInterval(cursorTimer);
  }, []);

  const getProgressColor = (step: number) => {
    if (currentStep === 3) return 'bg-purple-400 w-6';
    if (step < currentStep) return 'bg-blue-400 w-4';
    if (step === currentStep) return 'bg-purple-400 w-6';
    return 'bg-slate-700 w-4';
  };

  return (
    <div className="glass-card p-6 space-y-4 w-full max-w-lg">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
        <span className="w-3 h-3 rounded-full bg-red-500/50"></span>
        <span className="w-3 h-3 rounded-full bg-yellow-500/50"></span>
        <span className="w-3 h-3 rounded-full bg-green-500/50"></span>
        <span className="ml-2">use-ai-writer.com</span>
        <span className="ml-auto text-blue-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> AI
        </span>
      </div>

      <div className="space-y-4 min-h-[320px] flex flex-col justify-between">
        <div className="space-y-2">
          <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">User</div>
          <div className="glass-card p-4 border-white/10">
            <p className="text-slate-300 font-mono text-sm leading-relaxed">
              {typedText}
              {(currentStep === 0 || currentStep === 1) && (
                <span className={`inline-block w-2 h-5 bg-blue-400 align-middle ml-0.5 ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
              )}
            </p>
          </div>
        </div>

        {currentStep >= 2 && (
          <div className="space-y-2">
            <div className="text-xs text-purple-400 font-mono uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3" /> Creative Interview Engine
            </div>
            <div className="space-y-2">
              {questions.slice(0, questionIndex + 1).map((q, i) => (
                <div key={i} className="glass-card-purple p-3 border-purple-500/10" style={{
                  opacity: 1,
                  transform: 'translateY(0)',
                  transition: 'all 0.4s ease-out'
                }}>
                  <p className="text-slate-200 font-mono text-sm leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-2 mt-2">
            <div className="text-xs text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Generated Draft
            </div>
            <div className="glass-card-emerald p-4 border-emerald-500/10">
              <pre className="text-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap">{generatedContent}</pre>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-1.5 mt-2">
        {[0, 1, 2].map((step) => (
          <div
            key={step}
            className={`h-1 rounded-full transition-all duration-300 ${getProgressColor(step)}`}
          />
        ))}
      </div>
    </div>
  );
}
