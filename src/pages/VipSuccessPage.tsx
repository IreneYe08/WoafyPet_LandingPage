import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";

export default function VipSuccessPage() {
  const trackedRef = useRef(false);
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackEvent("purchase", {
      value: 1.99,
      currency: "USD",
      section: "vip_success",
    });
    trackEvent("checkout_success", { section: "vip_success" });
  }, []);

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-[980px] px-5 sm:px-8 lg:px-12 py-14 md:py-16 font-sans">
        <h1 className="text-[44px] leading-[1.05] md:text-[56px] font-semibold tracking-tight text-[#1B1B1B]">
          Payment received ✅
        </h1>

        <p className="mt-4 text-[16px] md:text-[17px] leading-relaxed text-[#1B1B1B]/80">
          We’ve emailed your <b>50% OFF</b> code to the email you used at checkout.
          <br />
          Didn’t see it? Check Spam/Promotions, or contact{" "}
          <a className="text-[#FD8829] hover:underline underline-offset-4" href="mailto:support@woafmeow.com">
            support@woafmeow.com
          </a>.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold bg-[#1B1B1B] text-white hover:opacity-90"
          >
            Back to Home
          </Link>

          <a
            href="mailto:support@woafmeow.com"
            className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold border border-black/10 hover:border-black/20"
          >
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}