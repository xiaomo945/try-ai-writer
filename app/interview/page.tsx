"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, ArrowRight, ChevronRight, Brain, History, Save, X, Check, Lightbulb, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import { 
  rememberInterviewAnswers, 
  getPreviousInterviewTopics, 
  getPreviousInterviewQuestions,
  hasInterviewedAbout,
  findSimilarPreviousTopic,
  clearInterviewMemory,
  type InterviewRecord
} from "@/lib/interview-memory";

import { NavWrapper } from "@/app/components/NavWrapper";

export default function InterviewPage() {
  const [step, setStep] = useState<"intro" | "interview" | "complete">("intro");
  const [topic, setTopic] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [previousTopics, setPreviousTopics] = useState<string[]>([]);
  const [similarTopic, setSimilarTopic] = useState<string | null>(null);
  const [interviewRecords, setInterviewRecords] = useState<InterviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [questions, setQuestions] = useState<string[]>([]);

  useEffect(() => {
    // Load previous interview data on mount
    if (typeof window !== "undefined") {
      setPreviousTopics(getPreviousInterviewTopics());
      // Also try to read the records directly for display
      const raw = localStorage.getItem("use-ai-writer-interview-memory");
      if (raw) {
        try {
          setInterviewRecords(JSON.parse(raw) as InterviewRecord[]);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleTopicSubmit = useCallback(() => {
    if (!topic.trim()) return;
    
    // Check for similar previous topics
    const similar = findSimilarPreviousTopic(topic);
    setSimilarTopic(similar);
    
    // Generate questions based on topic (simplified for now)
    const generatedQuestions = generateQuestions(topic);
    setQuestions(generatedQuestions);
    setAnswers(new Array(generatedQuestions.length).fill(""));
    setStep("interview");
    setCurrentQuestionIndex(0);
  }, [topic]);

  const generateQuestions = (userTopic: string): string[] => {
    const topicLower = userTopic.toLowerCase();
    const baseQuestions = [
      `What's the main goal you want to achieve with this ${topicLower.includes("email") ? "email" : topicLower.includes("blog") ? "blog post" : "content"}?`,
      `Who is your target audience for this?`,
      `What key message or takeaway do you want to convey?`,
      `Are there any specific examples or anecdotes you want to include?`,
      `What tone or style are you aiming for? (e.g., professional, casual, persuasive)`
    ];
    
    // Add topic-specific questions
    if (topicLower.includes("email")) {
      baseQuestions.push("What action do you want the recipient to take?");
      baseQuestions.push("Is there a deadline or urgency we should emphasize?");
    } else if (topicLower.includes("blog") || topicLower.includes("article")) {
      baseQuestions.push("What SEO keywords are important for this piece?");
      baseQuestions.push("Who is your main competitor or alternative in this space?");
    } else if (topicLower.includes("social") || topicLower.includes("twitter") || topicLower.includes("linkedin")) {
      baseQuestions.push("What platform is this for primarily?");
      baseQuestions.push("Do you want to encourage engagement (comments, shares, likes)?");
    }
    
    return baseQuestions;
  };

  const handleAnswer = useCallback((answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  }, [answers, currentQuestionIndex]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Save to interview memory
      rememberInterviewAnswers(questions, answers, topic);
      // Refresh the topics list
      setPreviousTopics(getPreviousInterviewTopics());
      const raw = localStorage.getItem("use-ai-writer-interview-memory");
      if (raw) {
        try {
          setInterviewRecords(JSON.parse(raw) as InterviewRecord[]);
        } catch {
          // ignore
        }
      }
      setStep("complete");
    }
  }, [currentQuestionIndex, questions, answers, topic]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);

  const handleRestart = useCallback(() => {
    setStep("intro");
    setTopic("");
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuestions([]);
    setSimilarTopic(null);
  }, []);

  const handleUsePreviousInterview = useCallback((record: InterviewRecord) => {
    setTopic(record.topic);
    // Pre-fill answers based on previous interview if we can match questions
    setAnswers(questions.map(q => {
      const matchingRecord = interviewRecords.find(r => r.question === q);
      return matchingRecord?.answer || "";
    }));
    setShowMemoryPanel(false);
  }, [questions, interviewRecords]);

  const handleClearInterviewMemory = useCallback(() => {
    if (confirm("Are you sure you want to clear all interview history?")) {
      clearInterviewMemory();
      setPreviousTopics([]);
      setInterviewRecords([]);
      setShowMemoryPanel(false);
    }
  }, []);

  return (
    <main className="flex flex-col items-center w-full bg-white dark:bg-[#0A0A0C] text-slate-900 dark:text-white min-h-screen">
      <NavWrapper />

      <div className="w-full max-w-4xl mx-auto px-4 pt-24 pb-16">
        {/* Interview Content */}
        {step === "intro" && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Creative Interview Engine</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900 dark:text-white">
                From Vague Idea to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  Perfect Draft
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Tell your digital twin what you want. It asks the right questions, then assembles the perfect prompt.
              </p>
            </div>

            {/* Main Input Card */}
            <div className="glass-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">What do you want to create?</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Describe your content goal</p>
                </div>
              </div>

              <div className="space-y-4">
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., A blog post about AI writing tools, A sales email for my SaaS product, A LinkedIn post about productivity..."
                  className="w-full h-32 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/50 text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleTopicSubmit();
                    }
                  }}
                />

                {similarTopic && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-purple-300 text-sm font-medium">You've interviewed about this before!</p>
                        <p className="text-slate-400 text-sm mt-1">Similar topic: {similarTopic}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleTopicSubmit}
                    disabled={!topic.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all"
                  >
                    Start Interview <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  {previousTopics.length > 0 && (
                    <button
                      onClick={() => setShowMemoryPanel(!showMemoryPanel)}
                      className="flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl transition-all"
                    >
                      <History className="w-5 h-5" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Previous Interviews Panel */}
            {showMemoryPanel && previousTopics.length > 0 && (
              <div className="glass-card p-6 border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-400" />
                    Interview History
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearInterviewMemory}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowMemoryPanel(false)}
                      className="p-1 hover:bg-white/10 rounded-full"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {interviewRecords.slice(0, 10).map((record, i) => (
                    <div
                      key={i}
                      onClick={() => handleUsePreviousInterview(record)}
                      className="p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-all border border-white/5 hover:border-purple-500/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">{record.topic}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            Q: {record.question}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {new Date(record.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-slate-500 text-center">
                    {interviewRecords.length} interview{interviewRecords.length !== 1 ? "s" : ""} saved
                  </p>
                </div>
              </div>
            )}

            {/* Quick Examples */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Blog Post", example: "A blog post about productivity tips for remote workers" },
                { title: "Sales Email", example: "A follow-up email to potential customers" },
                { title: "Social Post", example: "A LinkedIn post about AI tools" }
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTopic(item.example);
                  }}
                  className="glass-card p-4 text-left hover:border-blue-500/30 transition-all"
                >
                  <p className="text-blue-400 text-sm font-medium mb-2">{item.title}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{item.example}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "interview" && (
          <div className="space-y-8">
            {/* Progress Bar */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="text-sm text-blue-400">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="glass-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <ChevronRight className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Question {currentQuestionIndex + 1}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Answer in your own words</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-lg text-slate-900 dark:text-white mb-2">{questions[currentQuestionIndex]}</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm">Topic: {topic}</p>
              </div>

              <textarea
                value={answers[currentQuestionIndex] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-40 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none focus:border-purple-500/50 text-base"
              />

              <div className="flex items-center gap-4 mt-6">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-4 rounded-xl transition-all border border-white/10"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    Previous
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  disabled={!answers[currentQuestionIndex]?.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all"
                >
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>Next <ArrowRight className="w-5 h-5" /></>
                  ) : (
                    <>Complete Interview <Check className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Answer Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Keep it concise and professional",
                "Make it friendly and conversational",
                "Focus on benefits and value",
                "Use storytelling and examples"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(suggestion)}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-300 text-left transition-all border border-white/5 hover:border-blue-500/20"
                >
                  💡 {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="space-y-8">
            {/* Success Card */}
            <div className="glass-card p-6 sm:p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Interview Complete!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto">
                Your digital twin has captured your requirements and preferences. Now let's create something amazing.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <Link 
                  href="/write"
                  className="flex-1 sm:flex-none min-w-[200px] flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Writing
                </Link>
                <button
                  onClick={handleRestart}
                  className="flex-1 sm:flex-none min-w-[200px] flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-4 px-8 rounded-xl transition-all border border-white/10"
                >
                  New Interview
                </button>
              </div>
            </div>

            {/* Interview Summary */}
            <div className="glass-card p-6 sm:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Save className="w-5 h-5 text-emerald-400" />
                Interview Summary
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Topic</p>
                  <p className="text-slate-900 dark:text-white font-medium">{topic}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Your Answers</p>
                  {questions.map((q, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-lg">
                      <p className="text-sm text-blue-400 mb-2">{q}</p>
                      <p className="text-slate-700 dark:text-slate-300">{answers[i] || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
