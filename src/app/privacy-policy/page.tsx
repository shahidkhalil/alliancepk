import type { Metadata } from "next";
import PageWrapper from "@/components/PageWrapper";

export const metadata: Metadata = {
  title: "Privacy Policy | Alliance Tech",
  description: "How Alliance Tech (PVT) LTD collects, uses, and protects your information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicy() {
  return (
    <PageWrapper>
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-gray-400 text-sm mb-10">Last updated: July 2026</p>

          <div className="space-y-8 text-gray-600 leading-relaxed text-sm">
            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">1. Information We Collect</h2>
              <p>
                When you submit a form on our website or message us on WhatsApp, we collect your name, phone number,
                email address, clinic name, clinic type, and any message you provide. We do not collect this
                information unless you voluntarily submit it to us.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">2. How We Use Your Information</h2>
              <p>
                We use the information you provide solely to respond to your inquiry, schedule a consultation, and
                communicate with you about our services. We do not sell or rent your information to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">3. How We Store Your Information</h2>
              <p>
                Form submissions are stored securely using Google Firebase (Firestore). We take reasonable measures
                to protect your data from unauthorized access, alteration, or disclosure.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">4. Third-Party Services</h2>
              <p>
                We use WhatsApp Business for communication, Google Firebase for data storage and hosting,
                Google Analytics 4 and Google Tag Manager for consented analytics, and Microsoft Clarity
                when configured for consented usability insights. These providers may process data in
                accordance with their own privacy policies.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">5. Cookies and Analytics Choices</h2>
              <p>
                Necessary storage supports security and form functionality. Optional analytics, marketing,
                and preference technologies are disabled until you make a choice in our consent banner.
                Analytics may collect pages viewed, anonymous interactions, referral and campaign source,
                approximate device information, and performance metrics. We do not send form contents,
                names, email addresses, or phone numbers to analytics services. You can change your choice
                at any time through the Cookie Settings link in the website footer.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">6. Retention and Security</h2>
              <p>
                We retain inquiry information only as long as reasonably necessary to respond, provide
                services, meet legal obligations, and maintain business records. Analytics retention is
                controlled through the relevant analytics platform settings. We use reasonable technical
                and organizational measures to protect information, but no internet transmission is
                completely risk-free.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">7. Your Rights</h2>
              <p>
                You may request that we delete or correct your personal information at any time by emailing us at{" "}
                <a href="mailto:Sales@alliancetechltd.com" className="text-[#0077A8] font-semibold hover:underline">
                  Sales@alliancetechltd.com
                </a>.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#00283C] mb-2">8. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, contact us at{" "}
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
