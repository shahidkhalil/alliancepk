"use client";
import { FormProvider, useForm } from "@/context/FormContext";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import FinalCTA from "@/components/FinalCTA";
import HomeBelowFold from "@/components/HomeBelowFold";

const ConsultationForm = dynamic(() => import("@/components/ConsultationForm"), { ssr: false });
const AuditChatWidget = dynamic(() => import("@/components/AuditChatWidget"), { ssr: false });
const MobileStickySalesBar = dynamic(() => import("@/components/MobileStickySalesBar"), { ssr: false });

function HomeContent() {
  const { isOpen, closeForm } = useForm();
  return (
    <main className="relative min-h-screen w-full max-w-full overflow-x-clip bg-white">
      {/* Only download form/Firebase when the user opens the audit modal */}
      {isOpen && <ConsultationForm isOpen={isOpen} onClose={closeForm} />}
      <AuditChatWidget />
      <Navigation />
      <Hero />
      <HomeBelowFold />
      <FinalCTA />
      <Footer />
      <MobileStickySalesBar />
    </main>
  );
}

export default function Home() {
  return (
    <FormProvider>
      <HomeContent />
    </FormProvider>
  );
}
