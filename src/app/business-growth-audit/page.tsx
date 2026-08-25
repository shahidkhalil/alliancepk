"use client";

import PageWrapper from "@/components/PageWrapper";
import BusinessAudit from "@/components/business-audit/BusinessAudit";

export default function BusinessGrowthAuditPage() {
  return (
    <PageWrapper>
      <section
        className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,180,216,0.16) 0%, transparent 60%), linear-gradient(180deg, #041820 0%, #031219 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <BusinessAudit />
        </div>
      </section>
    </PageWrapper>
  );
}
