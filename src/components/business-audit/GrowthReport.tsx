"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  TrendingUp,
  Briefcase,
  Clock,
  DollarSign,
  ListChecks,
  ArrowRight,
  MessageCircle,
  FileText,
} from "lucide-react";
import { useForm } from "@/context/FormContext";
import ScoreGauge from "./ScoreGauge";
import LeadCaptureForm from "./LeadCaptureForm";
import type { AuditAnswers, BusinessGrowthReport } from "@/lib/businessAuditTypes";

type GrowthReportProps = {
  report: BusinessGrowthReport;
  answers: AuditAnswers;
};

function ReportSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof AlertTriangle;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="card-white rounded-2xl p-6 lg:p-7 h-full border border-[#00283C]/06">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#00283C]/06">
        <span className="w-9 h-9 rounded-lg bg-[#E8F4F8] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#0077A8]" strokeWidth={2} />
        </span>
        <h3 className="text-base font-extrabold text-[#00283C]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-[#00283C]/45">No items listed.</p>;
  return (
    <ul className="space-y-3 text-sm leading-relaxed text-[#00283C]/75">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] flex-shrink-0 mt-2" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function actionPlanBadge(index: number, total: number): { label: string; className: string } {
  if (index === 0) {
    return { label: "Quick win", className: "bg-emerald-50 text-emerald-700 border-emerald-200/80" };
  }
  if (index <= Math.min(2, total - 2)) {
    return { label: "This month", className: "bg-amber-50 text-amber-800 border-amber-200/80" };
  }
  return { label: "This quarter", className: "bg-sky-50 text-[#0077A8] border-[#00B4D8]/30" };
}

export default function GrowthReportView({ report, answers }: GrowthReportProps) {
  const { openForm } = useForm();

  return (
    <div className="space-y-6 lg:space-y-8">
      <div id="growth-report-print" className="space-y-6 lg:space-y-8">
        {/* Score + summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-[#00283C]/06 overflow-hidden relative"
        >
          <span aria-hidden className="card-deco-dots" />
          <div className="relative z-[1] flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 lg:gap-12">
            <div className="flex-shrink-0">
              <ScoreGauge score={report.growthScore} />
            </div>
            <div className="flex-1 w-full text-center sm:text-left">
              <span className="badge-light inline-flex mb-3">YOUR GROWTH REPORT</span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#00283C] tracking-tight mb-3">
                Executive Summary
              </h2>
              <p className="text-sm lg:text-base text-[#00283C]/65 leading-relaxed">{report.summary}</p>
              <div className="mt-5 pt-4 border-t border-[#00283C]/06 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-[#00283C]/50">
                <span>{answers.businessType}</span>
                <span className="hidden sm:inline text-[#00283C]/20">|</span>
                <span>{answers.monthlyCustomers} customers/mo</span>
                <span className="hidden sm:inline text-[#00283C]/20">|</span>
                <span>Budget: {answers.marketingBudget}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          <ReportSection icon={AlertTriangle} title="Biggest Business Issues">
            <BulletList items={report.biggestIssues} />
          </ReportSection>
          <ReportSection icon={TrendingUp} title="Revenue Opportunities">
            <BulletList items={report.opportunities} />
          </ReportSection>
        </div>

        <div className="card-white rounded-2xl p-6 lg:p-7 border border-[#00283C]/06">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#00283C]/06">
            <span className="w-9 h-9 rounded-lg bg-[#00283C] flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-white" strokeWidth={2} />
            </span>
            <h3 className="text-base font-extrabold text-[#00283C]">Recommended Alliance Tech Services</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.recommendedServices.map((service) => (
              <span
                key={service}
                className="inline-flex items-center px-3.5 py-2 rounded-full text-xs font-bold bg-[#E8F4F8] text-[#0077A8] border border-[#00B4D8]/20"
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <ReportSection icon={Clock} title="Estimated Timeline">
            <p className="text-sm text-[#00283C]/70 leading-relaxed">{report.timeline}</p>
          </ReportSection>
          <ReportSection icon={DollarSign} title="Expected ROI">
            <p className="text-sm text-[#00283C]/70 leading-relaxed">{report.estimatedROI}</p>
          </ReportSection>
        </div>

        <ReportSection icon={ListChecks} title="Action Plan">
          <ol className="space-y-2.5">
            {report.nextSteps.map((step, i) => {
              const badge = actionPlanBadge(i, report.nextSteps.length);
              return (
                <li
                  key={i}
                  className="flex gap-3 sm:gap-4 rounded-xl border border-[#00283C]/08 bg-[#F8FCFE] px-4 py-3.5 sm:px-5 sm:py-4"
                >
                  <span className="w-7 h-7 rounded-full bg-[#00283C] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#00283C]/80 leading-relaxed pr-1">{step}</p>
                    <span
                      className={`inline-flex mt-2.5 text-[10px] font-bold tracking-wide px-2.5 py-0.5 rounded-full border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </ReportSection>
      </div>

      <LeadCaptureForm answers={answers} report={report} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl p-8 lg:p-10 text-center card-cta-dark card-cta-glow relative overflow-hidden mb-8 md:mb-0"
      >
        <div className="relative z-[1]">
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-3">
            Ready to Grow Your Business?
          </h3>
          <p className="text-white/65 text-sm max-w-lg mx-auto mb-8">
            Turn this AI roadmap into real results — websites, SEO, ads, and AI automation built for
            businesses like yours.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-xl mx-auto">
            <button
              type="button"
              onClick={openForm}
              className="inline-flex items-center justify-center gap-2 bg-white text-[#00283C] font-bold px-7 py-3.5 rounded-lg text-sm hover:bg-[#E8F7FB] transition-colors flex-1"
            >
              Book Free Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/about#contact"
              className="inline-flex items-center justify-center gap-2 border border-white/25 text-white font-semibold px-7 py-3.5 rounded-lg text-sm hover:bg-white/10 transition-colors flex-1"
            >
              <FileText className="w-4 h-4" />
              Get Proposal
            </a>
            <a
              href="mailto:Sales@alliancetechltd.com?subject=Business%20Growth%20Audit%20Follow-up"
              className="inline-flex items-center justify-center gap-2 border border-white/25 text-white font-semibold px-7 py-3.5 rounded-lg text-sm hover:bg-white/10 transition-colors flex-1"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
