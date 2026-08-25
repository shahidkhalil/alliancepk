import type { Metadata } from "next";
import PageWrapper from "@/components/PageWrapper";

export const metadata: Metadata = {
  title: "Terms of Service | Alliance Tech",
  description: "The terms governing your use of the Alliance Tech (PVT) LTD website and services.",
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsOfService() {
  return (
    <PageWrapper>
      <section className="legal-page pt-32 pb-20">
        <div className="legal-page-inner mx-auto max-w-3xl px-6">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mb-3">Terms of Service</h1>
          <p className="text-gray-400 text-sm mb-10">Last updated: June 2026</p>

          <div className="space-y-8 text-gray-600 leading-relaxed text-sm">
            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing this website or submitting a form, you agree to these Terms of Service. If you do not
                agree, please do not use this website.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">2. Services Described</h2>
              <p>
                Alliance Tech (PVT) LTD provides digital marketing, website development, AI automation, and related
                growth services for dental and aesthetic clinics. Specific service terms, pricing, and deliverables
                are agreed separately in a signed client contract before any paid engagement begins.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">3. No Guarantee of Results</h2>
              <p>
                While we aim to deliver measurable growth, marketing results depend on factors outside our direct
                control (market conditions, competition, clinic operations). Any results referenced on this website
                are illustrative of past client outcomes and are not a guarantee of future performance, except where
                explicitly stated in a signed service agreement.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">4. Website Use</h2>
              <p>
                You agree not to misuse this website, attempt unauthorized access to our systems, or submit false
                information through our forms.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">5. Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, and logos, is the property of Alliance Tech
                (PVT) LTD unless otherwise noted, and may not be reproduced without permission.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">6. Changes to These Terms</h2>
              <p>
                We may update these Terms of Service from time to time. Continued use of the website after changes
                are posted constitutes acceptance of the revised terms.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">7. Contact Us</h2>
              <p>
                Questions about these terms can be sent to{" "}
                <a href="mailto:Sales@alliancetechltd.com" className="text-[#0077A8] font-semibold hover:underline">
                  Sales@alliancetechltd.com
                </a>
                , or write to us at 67 Lona Ln, Rensselaer, NY 12144, United States.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
