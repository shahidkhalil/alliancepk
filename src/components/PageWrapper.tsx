"use client";
import { ReactNode } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import dynamic from "next/dynamic";
import { FormProvider, useForm } from "@/context/FormContext";
import { PackageOrderProvider } from "@/context/PackageOrderContext";

// Lazy: both pull in the Firebase SDK and are only needed on interaction.
const ConsultationForm = dynamic(() => import("./ConsultationForm"), { ssr: false });
const AuditChatWidget = dynamic(() => import("./AuditChatWidget"), { ssr: false });
const PackageOrderForm = dynamic(() => import("./PackageOrderForm"), { ssr: false });
const MobileStickySalesBar = dynamic(() => import("./MobileStickySalesBar"), { ssr: false });

function PageContent({ children }: { children: ReactNode }) {
  const { isOpen, closeForm } = useForm();
  return (
    <div className="site-shell relative min-h-screen w-full max-w-full overflow-x-clip">
      <div aria-hidden className="site-shell-glow site-shell-glow--one" />
      <div aria-hidden className="site-shell-glow site-shell-glow--two" />
      <Navigation />
      <main className="relative w-full max-w-full overflow-x-clip">{children}</main>
      <Footer />
      <MobileStickySalesBar />
      {isOpen && <ConsultationForm isOpen={isOpen} onClose={closeForm} />}
      <AuditChatWidget />
      <PackageOrderForm />
    </div>
  );
}

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <FormProvider>
      <PackageOrderProvider>
        <PageContent>{children}</PageContent>
      </PackageOrderProvider>
    </FormProvider>
  );
}
