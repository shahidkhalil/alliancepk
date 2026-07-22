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

function PageContent({ children }: { children: ReactNode }) {
  const { isOpen, closeForm } = useForm();
  return (
    <div className="relative min-h-screen bg-white overflow-x-clip max-w-[100vw]">
      <Navigation />
      <main className="relative overflow-x-clip max-w-[100vw]">{children}</main>
      <Footer />
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
