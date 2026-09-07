/** @type {import('next').NextConfig} */
const CF = "https://asia-south1-alliancepak.cloudfunctions.net";

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Local dev: proxy /api/* to Cloud Functions (same paths as Firebase Hosting rewrites).
  async rewrites() {
    return [
      { source: "/api/receptionist", destination: `${CF}/clinicReceptionist` },
      { source: "/api/realtime-token", destination: `${CF}/realtimeToken` },
      { source: "/api/book", destination: `${CF}/bookAppointmentHttp` },
      { source: "/api/lookup-appointments", destination: `${CF}/lookupAppointmentsHttp` },
      { source: "/api/business-audit", destination: `${CF}/auditWebsite` },
    ];
  },
};

module.exports = nextConfig;
