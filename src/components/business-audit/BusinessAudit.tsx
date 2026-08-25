"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, BarChart3, Target, Zap } from "lucide-react";
import QuestionCard from "./QuestionCard";
import LoadingAnalysis from "./LoadingAnalysis";
import GrowthReportView from "./GrowthReport";
import {
  AUDIT_QUESTIONS,
  EMPTY_ANSWERS,
  type AuditAnswers,
  type AuditStep,
  type BusinessGrowthReport,
} from "@/lib/businessAuditTypes";
import { fetchBusinessGrowthReport } from "@/lib/businessAuditApi";
import { trackDemoComplete, trackDemoStart, trackEvent } from "@/lib/analytics";

const MIN_LOADING_MS = 3200;

export default function BusinessAudit() {
  const [step, setStep] = useState<AuditStep>("hero");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AuditAnswers>({ ...EMPTY_ANSWERS });
  const [report, setReport] = useState<BusinessGrowthReport | null>(null);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const auditStartedAtRef = useRef(0);

  const currentQuestion = AUDIT_QUESTIONS[questionIndex];
  const currentValue = answers[currentQuestion?.id ?? "businessType"] ?? "";

  const canContinue =
    currentQuestion?.type === "options"
      ? Boolean(currentValue)
      : currentValue.trim().length >= 2;

  const updateAnswer = useCallback((value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }, [currentQuestion]);

  const runAnalysis = async (finalAnswers: AuditAnswers) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setStep("loading");
    setError("");

    const started = Date.now();
    try {
      const [result] = await Promise.all([
        fetchBusinessGrowthReport(finalAnswers),
        new Promise((r) => setTimeout(r, MIN_LOADING_MS)),
      ]);
      const elapsed = Date.now() - started;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
      }
      setReport(result);
      setStep("report");
      trackDemoComplete({
        demo_type: "business_growth_audit",
        duration: Math.round((Date.now() - auditStartedAtRef.current) / 1000),
      });
    } catch (err) {
      trackEvent("api_error", {
        api_name: "business_growth_audit",
        error_message: err instanceof Error ? err.message : "Growth audit failed",
      });
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("questions");
      setQuestionIndex(AUDIT_QUESTIONS.length - 1);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    if (!canContinue || isGenerating) return;

    if (questionIndex < AUDIT_QUESTIONS.length - 1) {
      setQuestionIndex((i) => i + 1);
      return;
    }

    runAnalysis(answers);
  };

  const handleBack = () => {
    if (questionIndex > 0) setQuestionIndex((i) => i - 1);
    else setStep("hero");
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === "hero" && (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="card-white rounded-2xl p-8 lg:p-12 border border-[#00283C]/06 relative overflow-hidden">
              <span aria-hidden className="card-deco-dots" />
              <span aria-hidden className="card-deco-arc" />

              <div className="relative z-[1]">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6F4F8] text-[#0077A8] text-xs font-bold uppercase tracking-wider mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  Free AI Tool
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-[#00283C] tracking-tight leading-tight mb-4">
                  Get Your Free AI Business Growth Audit
                </h1>
                <p className="text-base text-[#00283C]/60 leading-relaxed max-w-xl mx-auto mb-8">
                  Answer a few questions and receive an AI-generated growth strategy tailored to your
                  business — opportunities, action plan, and recommended services.
                </p>

                <div className="grid sm:grid-cols-3 gap-3 mb-10 text-left max-w-lg mx-auto sm:max-w-none">
                  {[
                    { icon: BarChart3, label: "Growth score & gaps" },
                    { icon: Target, label: "Tailored opportunities" },
                    { icon: Zap, label: "Action plan in minutes" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5 rounded-xl bg-[#F8FCFE] border border-[#00283C]/06 px-3 py-3"
                    >
                      <item.icon className="w-4 h-4 text-[#0077A8] flex-shrink-0" strokeWidth={2} />
                      <span className="text-xs font-semibold text-[#00283C]/70">{item.label}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    auditStartedAtRef.current = Date.now();
                    trackDemoStart({ demo_type: "business_growth_audit" });
                    setStep("questions");
                  }}
                  className="btn-dark inline-flex items-center gap-2 px-8 py-4 text-base"
                >
                  Start Free Audit
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-xs text-[#00283C]/40 mt-4">5 questions · ~2 minutes · No credit card</p>
              </div>
            </div>
          </motion.div>
        )}

        {step === "questions" && currentQuestion && (
          <motion.div key={`q-${questionIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {error ? (
              <div className="max-w-xl mx-auto mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <QuestionCard
              question={currentQuestion}
              value={currentValue}
              onChange={updateAnswer}
              stepIndex={questionIndex}
              totalSteps={AUDIT_QUESTIONS.length}
              onBack={handleBack}
              onContinue={handleContinue}
              canContinue={canContinue}
              isGenerating={isGenerating}
            />
          </motion.div>
        )}

        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingAnalysis />
          </motion.div>
        )}

        {step === "report" && report && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <GrowthReportView report={report} answers={answers} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
