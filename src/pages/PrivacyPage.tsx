import { Link } from 'react-router-dom';
import { Section, SectionHeading } from '@/app/components/layout/Section';
import { Card } from '@/app/components/layout/Card';

export default function PrivacyPage() {
  return (
    <Section tone="warm">
      <div className="mx-auto max-w-[960px] px-5 sm:px-8 lg:px-12 xl:px-16 py-12 md:py-16">
        <SectionHeading
          title="Privacy Policy"
          subtitle="WoafyPet Privacy Policy (U.S.)"
          className="mb-8"
        />

        {/* Top nav links */}
        <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-black/70">
          <Link to="/privacy-choices" className="underline hover:text-black">
            Your Privacy Choices
          </Link>
          <span className="text-black/30">•</span>
          <Link to="/terms" className="underline hover:text-black">
            Terms of Service
          </Link>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="space-y-8 text-[15px] leading-relaxed text-black/80">
            {/* Intro + Company Info */}
            <section className="space-y-3">
              <p>
                WoafMeow Inc. (“WoafyPet,” “we,” “us,” “our”) respects your privacy. This Privacy
                Policy explains how we collect, use, disclose, and otherwise process information
                about you when you visit our websites, use our mobile applications, purchase our
                products, or use our connected devices and related services (collectively, the
                “Services”).
              </p>

              <div className="rounded-xl border border-black/10 bg-white p-4">
                <p className="font-semibold text-black">Company Information</p>
                <p>WoafMeow Inc.</p>
                <p>19756 Saddlecrest Drive, Walnut, CA 91789, USA</p>
                <p>Email: support@woafmeow.com</p>
                <p>
                  <span className="font-medium text-black">Effective Date:</span> 02.13.2026
                </p>
                <p>
                  <span className="font-medium text-black">Last Updated:</span> 02.13.2026
                </p>
              </div>
            </section>

            <hr className="border-black/10" />

            {/* 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">1. Scope</h2>
              <p>
                This Privacy Policy applies to “Personal Information,” meaning information that
                identifies, relates to, describes, is reasonably capable of being associated with,
                or could reasonably be linked (directly or indirectly) with an individual or
                household. It does not apply to de-identified or aggregated information that cannot
                reasonably be used to identify you.
              </p>
              <p>
                This Policy does not cover third-party websites, applications, or services that you
                access through the Services. Their privacy practices are governed by their own
                policies.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">
                2. U.S. Notice at Collection (Summary)
              </h2>
              <p>
                We may collect the categories of Personal Information described in Section 3,
                including identifiers (e.g., name, email, IP address), commercial information
                (orders), internet/network activity (usage and cookie/pixel data), approximate
                location (derived from IP), and connected-device data associated with your account
                (e.g., pet heart rate, respiratory rate, weight, and sleep-related metrics). We do
                not collect precise geolocation or biometric identifiers about you.
              </p>
              <p>
                We use Personal Information to operate and secure the Services, process orders,
                provide support, improve our products, and (where permitted) for marketing, targeted
                advertising, attribution, and analytics. We retain Personal Information as described
                in Section 10.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 3 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-black">3. Information We Collect</h2>
              <p>
                We collect information in three ways: (A) information you provide, (B) information
                collected automatically, and (C) information from third parties.
              </p>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">A. Information you provide</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Account and profile information: name, email address, phone number, login
                    credentials, preferences.
                  </li>
                  <li>
                    Order and fulfillment information: billing and shipping address, purchase
                    history, and fulfillment status (and, if applicable, information related to
                    returns, exchanges, or warranty support).
                  </li>
                  <li>
                    Customer support communications: messages you send us, emails, call recordings
                    (if any), and other information you provide when you contact support.
                  </li>
                  <li>
                    Marketing preferences: your subscription status and communication preferences
                    for email (and SMS, if offered).
                  </li>
                  <li>
                    Pet profile information (optional): pet name, breed, age, and other details you
                    choose to provide.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">
                  B. Information collected automatically (website/app)
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Device and usage information: IP address, browser type, device identifiers,
                    operating system, app version, language, referring URLs, pages/screens viewed,
                    session activity, timestamps, and diagnostic logs.
                  </li>
                  <li>
                    Cookies and similar technologies: information collected via cookies, pixels,
                    tags, SDKs, and similar technologies (see Section 6).
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">
                  C. Connected-device data (when you use WoafyPet devices)
                </h3>
                <p>
                  If you use WoafyPet connected devices, we may collect and process device-generated
                  data associated with your account or household, such as:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Pet vital and sleep-related metrics (e.g., pet heart rate, respiratory rate,
                    movement indicators, sleep duration/quality indicators)
                  </li>
                  <li>Weight measurements</li>
                  <li>Device performance and diagnostics (e.g., connectivity status, error logs)</li>
                </ul>

                <div className="rounded-xl border border-black/10 bg-white p-4">
                  <p className="font-semibold text-black">
                    IMPORTANT: NOT VETERINARY ADVICE. THE SERVICES AND ANY INSIGHTS, SUMMARIES, OR
                    ALERTS ARE PROVIDED FOR MONITORING AND INFORMATIONAL PURPOSES ONLY AND ARE NOT
                    INTENDED TO DIAGNOSE, TREAT, CURE, OR PREVENT ANY DISEASE. WoafyPet is not a
                    veterinary medical provider and does not provide veterinary diagnoses or
                    treatment. If you have concerns about your pet’s health, consult a licensed
                    veterinarian.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">D. Information from third parties</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Payment processors (Stripe): we receive transaction confirmations and limited
                    payment information (e.g., last four digits, card type, billing zip/postal code,
                    transaction identifiers). Full payment details are processed by Stripe.
                  </li>
                  <li>
                    Shipping/logistics partners: delivery updates, address validation, and
                    fulfillment status.
                  </li>
                  <li>
                    Advertising and analytics partners: information such as cookie identifiers,
                    device identifiers, and conversion/attribution events (see Section 6).
                  </li>
                  <li>
                    Cloud service providers: infrastructure and storage used to operate the Services
                    (e.g., hosting on cloud platforms).
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-black/10" />

            {/* 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">4. How We Use Information</h2>
              <p>We use Personal Information for the following business and commercial purposes:</p>
              {/* 注意：你发的“5280-5286”是明显粘贴污染，这里按正常编号渲染 */}
              <ol className="list-decimal pl-6 space-y-1">
                <li>
                  Provide and operate the Services (create and manage accounts; connect devices;
                  deliver features you request).
                </li>
                <li>Process transactions (payments, fulfillment, and customer service).</li>
                <li>
                  Communicate with you (service messages, security alerts, and support; and—if you
                  opt in—marketing communications).
                </li>
                <li>
                  Improve and develop products (analytics, troubleshooting, testing, quality
                  assurance, and feature development).
                </li>
                <li>Security and fraud prevention (protect the Services, users, and our business).</li>
                <li>
                  Advertising and marketing (including targeted advertising, attribution, and
                  measurement, subject to your choices and applicable law).
                </li>
                <li>
                  Compliance and legal (comply with laws, enforce terms, resolve disputes, respond
                  to lawful requests).
                </li>
              </ol>
            </section>

            <hr className="border-black/10" />

            {/* 5 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-black">5. How We Disclose Information</h2>
              <p>We may disclose Personal Information in the following ways:</p>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">A. Service providers / processors</h3>
                <p>
                  We share information with vendors who process information on our behalf to provide
                  services, such as payment processing, cloud hosting and storage, customer support
                  tools, email delivery vendors, analytics providers, and shipping/logistics partners.
                  These providers are contractually restricted from using Personal Information for
                  purposes other than providing services to us.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">B. Advertising and measurement partners</h3>
                <p>
                  If you allow advertising cookies/pixels/SDKs, we may disclose certain identifiers
                  and event data (e.g., device/browser identifiers, IP address, page events, and
                  conversion events) to advertising and measurement partners to deliver and measure
                  ads, perform attribution, optimize campaigns, and build/measure audiences.
                </p>
                <p>
                  Depending on where you live, these disclosures may be considered “sale” or “sharing”
                  of Personal Information or “targeted advertising.” You can opt out as described in
                  Section 9.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">C. Legal, safety, and rights protection</h3>
                <p>
                  We may disclose information to comply with the law, respond to lawful requests,
                  protect rights and safety, investigate fraud or security incidents, or enforce our
                  agreements.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">D. Business transfers</h3>
                <p>
                  We may disclose information in connection with a merger, acquisition, financing,
                  reorganization, bankruptcy, or sale/transfer of all or part of our business.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">E. With your direction</h3>
                <p>
                  We may disclose information when you request or direct us to do so, such as when
                  you choose to share information or connect third-party integrations.
                </p>
              </div>
            </section>

            <hr className="border-black/10" />

            {/* 6 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-black">
                6. Cookies, Pixels, SDKs, and Similar Technologies
              </h2>
              <p>
                We use cookies and similar technologies (including pixels, tags, and SDKs) to operate
                and improve the Services and, where permitted, to support advertising.
              </p>

              <div className="space-y-2">
                <p className="font-semibold text-black">Technologies we use (examples)</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Strictly Necessary: required for core functionality, security, and fraud prevention.</li>
                  <li>Analytics: to understand how the Services are used and to improve performance (e.g., Google Analytics in the future).</li>
                  <li>
                    Advertising: to deliver, measure, and optimize advertising and to perform attribution and
                    retargeting (e.g., Meta Pixel; and in the future Google Ads and TikTok Pixel).
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-black">Controls</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You can control cookies through your browser settings and may delete stored cookies.</li>
                  <li>You may opt out of certain disclosures/processing (where applicable) via the choices in Section 9.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-black">Global Privacy Control (GPC)</p>
                <p>
                  Where required by applicable law, we treat recognized Global Privacy Control (GPC)
                  signals as a request to opt out of sale/sharing of Personal Information and/or
                  targeted advertising on that browser/device. Our processing of GPC signals occurs
                  in a frictionless manner.
                </p>
              </div>
            </section>

            <hr className="border-black/10" />

            {/* 7 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">
                7. Marketing Communications (Email and SMS)
              </h2>
              <p>
                Email. You may unsubscribe at any time by using the “unsubscribe” link in our emails.
              </p>
              <p>
                SMS/Text Messages (if offered). If we offer SMS/text message programs and you opt in,
                program terms (including instructions such as “STOP” to cancel and “HELP” for help,
                message frequency, and whether message/data rates may apply) will be provided at the
                time you sign up and/or in the applicable program terms. Consent to receive marketing
                text messages is not required to purchase products or services.
              </p>
              <p>
                We may send transactional or service-related messages (e.g., order updates or
                security notices) that are not marketing in nature.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 8 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">
                8. Sensitive Data, Precise Geolocation, and Biometrics
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>We do not collect precise geolocation data to track your exact location.</li>
                <li>We do not collect biometric identifiers about you (e.g., face templates, fingerprints).</li>
                <li>
                  We process connected-device data associated with your account to provide the
                  Services. We do not treat pet metrics as human medical information.
                </li>
              </ul>
            </section>

            <hr className="border-black/10" />

            {/* 9 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-black">9. Your U.S. Privacy Rights and Choices</h2>
              <p>
                Residents of certain U.S. states may have privacy rights under applicable state laws.
                Depending on your state of residence and subject to legal limitations and exceptions,
                you may have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access/Know</li>
                <li>Delete</li>
                <li>Correct</li>
                <li>Portability</li>
                <li>
                  Opt out of certain processing, including targeted advertising, and in some jurisdictions,
                  the sale of Personal Information or sharing for cross-context behavioral advertising
                </li>
                <li>Non-discrimination</li>
              </ul>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">A. Opt-out of “Sale” / “Sharing” / Targeted Advertising</h3>
                <p>Where applicable, you can opt out by:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Visiting Your Privacy Choices:{' '}
                    <Link to="/privacy-choices" className="underline">
                      /privacy-choices
                    </Link>
                  </li>
                  <li>Enabling Global Privacy Control (GPC) in a supported browser/device (where recognized)</li>
                </ul>
                <p className="font-semibold text-black">
                  Important note about scope: THIS OPT-OUT APPLIES TO THE BROWSER AND/OR DEVICE YOU
                  ARE USING. IF YOU USE A DIFFERENT BROWSER OR DEVICE, YOU MAY NEED TO SET YOUR
                  PREFERENCES AGAIN.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">B. Submitting a privacy request</h3>
                <p>
                  You may submit a privacy request by emailing support@woafmeow.com. See Section 9.E
                  for details on required information and verification.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">C. Authorized agents (where permitted)</h3>
                <p>
                  If you use an authorized agent to submit a request on your behalf, we may require
                  proof of authorization and may verify your identity directly.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">D. Appeals (where required)</h3>
                <p>
                  If we deny your request, you may appeal by emailing support@woafmeow.com with the
                  subject line “Privacy Appeal,” and include your original request details.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-black">E. How to Submit a Privacy Request</h3>
                <p>
                  You may submit a request to access/know, delete, correct, or obtain a portable copy
                  of certain Personal Information by emailing support@woafmeow.com.
                </p>
                <p>To help us process your request efficiently, please include in your email:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Your full name</li>
                  <li>The email address associated with your WoafyPet account (or your purchase)</li>
                  <li>Your state of residence (so we can determine the applicable legal requirements)</li>
                  <li>The type of request (Access/Know, Delete, Correct, or Portability)</li>
                  <li>
                    Any additional details that help us locate the information, such as an order
                    number, device nickname/identifier, or approximate purchase date (if applicable)
                  </li>
                </ul>
                <p>
                  For security and fraud prevention, we will verify your identity before fulfilling
                  certain requests. Verification may include confirming access to the email address
                  associated with your account or matching information related to your purchase (such
                  as an order number and shipping details). If we are unable to verify your identity,
                  we may request additional information or deny the request as permitted by law.
                </p>
                <p>
                  We will respond to verified requests within the timeframe required by applicable
                  law, and may extend the response period where permitted due to complexity or volume.
                  If we deny your request (in whole or in part), we will provide an explanation where
                  required and permitted by law.
                </p>
              </div>
            </section>

            <hr className="border-black/10" />

            {/* 10 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">10. Data Retention</h2>
              <p>We retain Personal Information only for as long as reasonably necessary to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>provide the Services (including maintaining your account and device history while your account is active),</li>
                <li>fulfill the purposes described in this Policy,</li>
                <li>comply with legal obligations (e.g., tax, accounting, and regulatory requirements),</li>
                <li>resolve disputes, and</li>
                <li>enforce our agreements.</li>
              </ul>
              <p>
                Retention periods vary depending on the type of information and the context. We may
                retain de-identified or aggregated information for analytics and product improvement.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 11 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">11. Security</h2>
              <p>
                We use reasonable administrative, technical, and organizational safeguards designed to
                protect Personal Information. However, no method of transmission or storage is 100%
                secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 12 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">12. Children’s Privacy</h2>
              <p>
                The Services are not directed to children under 13, and we do not knowingly collect
                Personal Information from children under 13. If we learn we have collected such
                information, we will take steps to delete it.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 13 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">13. International Users</h2>
              <p>
                If you access the Services from outside the United States, your information may be
                processed in the United States and other locations where we or our service providers
                operate. Data protection laws in those locations may differ from the laws in your
                jurisdiction.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 14 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">14. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. If we make material changes, we
                will provide notice as required by law and update the “Last Updated” date.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 15 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">15. Contact Us</h2>
              <p>
                If you have questions or requests regarding this Privacy Policy or our privacy
                practices, contact us at:
              </p>
              <p>
                WoafMeow Inc.
                <br />
                19756 Saddlecrest Drive, Walnut, CA 91789, USA
                <br />
                Email: support@woafmeow.com
              </p>
            </section>

            {/* Bottom CTA */}
            <div className="pt-2 text-sm text-black/60">
              Looking for controls? Go to{' '}
              <Link to="/privacy-choices" className="underline hover:text-black">
                Your Privacy Choices
              </Link>
              .
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}