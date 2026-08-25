"use client";

import PageWrapper from "@/components/PageWrapper";
import BusinessAudit from "@/components/business-audit/BusinessAudit";

export default function BusinessGrowthAuditPage() {
  return (
    <PageWrapper>
      <section
        className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,180,216,0.08) 0%, transparent 60%), linear-gradient(180deg, #f8fcfe 0%, #ffffff 50%, #ffffff 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <BusinessAudit />
        </div>
      </section>
    </PageWrapper>
  );
}
