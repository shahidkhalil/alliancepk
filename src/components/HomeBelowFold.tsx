"use client";
import Problems from "@/components/Problems";
import AuditPromo from "@/components/AuditPromo";
import ForWho from "@/components/ForWho";
import Solutions from "@/components/Solutions";
import AIReceptionist from "@/components/AIReceptionist";
import Process from "@/components/Process";
import TestimonialVideo from "@/components/TestimonialVideo";
import Guarantee from "@/components/Guarantee";
import PricingPackages from "@/components/PricingPackages";
import FAQ from "@/components/FAQ";

/** Live homepage section order — matches alliancepak.web.app */
export default function HomeBelowFold() {
  return (
    <>
      <Problems />
      <AuditPromo />
      <ForWho />
      <Solutions />
      <AIReceptionist />
      <Process />
      <TestimonialVideo />
      <Guarantee />
      <PricingPackages />
      <FAQ />
    </>
  );
}
