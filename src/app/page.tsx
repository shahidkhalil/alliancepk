"use client";
import { FormProvider, useForm } from "@/context/FormContext";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import CapabilityStrip from "@/components/CapabilityStrip";
import Footer from "@/components/Footer";
import FinalCTA from "@/components/FinalCTA";
import HomeBelowFold from "@/components/HomeBelowFold";

const ConsultationForm = dynamic(() => import("@/components/ConsultationForm"), { ssr: false });
const AuditChatWidget = dynamic(() => import("@/components/AuditChatWidget"), { ssr: false });
const MobileStickySalesBar = dynamic(() => import("@/components/MobileStickySalesBar"), { ssr: false });

function HomeContent() {
  const { isOpen, closeForm } = useForm();
  return (
    <div className="site-shell relative min-h-screen w-full max-w-full overflow-x-clip">
      <div aria-hidden className="site-shell-glow site-shell-glow--one" />
      <div aria-hidden className="site-shell-glow site-shell-glow--two" />
      {/* Only download form/Firebase when the user opens the audit modal */}
      {isOpen && <ConsultationForm isOpen={isOpen} onClose={closeForm} />}
      <AuditChatWidget />
      <Navigation />
      <main className="relative w-full max-w-full overflow-x-clip">
        <Hero />
        <CapabilityStrip />
        <HomeBelowFold />
        <FinalCTA />
      </main>
      <Footer />
      <MobileStickySalesBar />
    </div>
  );
}

export default function Home() {
  return (
    <FormProvider>
      <HomeContent />
    </FormProvider>
  );
}
