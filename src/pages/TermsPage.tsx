import { Link } from 'react-router-dom';
import { Section, SectionHeading } from '@/app/components/layout/Section';
import { Card } from '@/app/components/layout/Card';

export default function TermsPage() {
  return (
    <Section tone="warm">
      <div className="mx-auto max-w-[960px] px-5 sm:px-8 lg:px-12 xl:px-16 py-12 md:py-16">
        <SectionHeading
          title="Terms of Service"
          subtitle="WoafyPet Terms of Service"
          className="mb-8"
        />

        {/* Top nav links */}
        <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-black/70">
          <Link to="/privacy" className="underline hover:text-black">
            Privacy Policy
          </Link>
          <span className="text-black/30">•</span>
          <Link to="/privacy-choices" className="underline hover:text-black">
            Your Privacy Choices
          </Link>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="space-y-8 text-[15px] leading-relaxed text-black/80">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-semibold text-black">
                WoafyPet Terms of Service
              </h1>
              <p>
                <span className="font-medium text-black">Effective Date:</span> 02.13.2026
              </p>
              <p>
                <span className="font-medium text-black">Last Updated:</span> 02.13.2026
              </p>
              <p>
                These Terms of Service (“Terms”) govern your access to and use of WoafyPet websites,
                mobile applications, connected devices (including smart pet beds and related
                hardware), and related services (collectively, the “Services”). The Services are
                provided by WoafMeow Inc. (“WoafyPet,” “we,” “us,” “our”).
              </p>
              <p>
                By accessing or using the Services, you agree to be bound by these Terms. If you do
                not agree, do not use the Services.
              </p>
            </div>

            <hr className="border-black/10" />

            {/* 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">
                1. IMPORTANT NOTICE — NOT VETERINARY ADVICE (CONSPICUOUS DISCLOSURE)
              </h2>
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <p className="font-semibold text-black">
                  THE SERVICES AND ANY INSIGHTS, SUMMARIES, OR ALERTS ARE PROVIDED FOR
                  INFORMATIONAL AND MONITORING PURPOSES ONLY AND ARE NOT INTENDED TO DIAGNOSE,
                  TREAT, CURE, OR PREVENT ANY DISEASE OR MEDICAL CONDITION.
                </p>
                <p className="mt-3 font-semibold text-black">
                  WOAFYPET IS NOT A VETERINARY MEDICAL PROVIDER. DO NOT USE THE SERVICES AS A
                  SUBSTITUTE FOR PROFESSIONAL VETERINARY ADVICE, DIAGNOSIS, OR TREATMENT. IF YOU
                  BELIEVE YOUR PET MAY BE ILL, IN PAIN, OR IN DISTRESS, CONTACT A LICENSED
                  VETERINARIAN PROMPTLY.
                </p>
              </div>
              <p>You acknowledge that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Pet health conditions can change quickly and may not be detectable by the Services.</li>
                <li>Alerts may be delayed, inaccurate, incomplete, or unavailable.</li>
                <li>You are solely responsible for decisions you make regarding your pet’s care.</li>
              </ul>
            </section>

            <hr className="border-black/10" />

            {/* 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">2. Eligibility and Account</h2>
              <p>
                You must be at least 18 years old (or the age of majority in your jurisdiction) to
                use the Services. You are responsible for maintaining the confidentiality of your
                account credentials and for all activity under your account.
              </p>
              <p>You agree to provide accurate information and to keep your account information up to date.</p>
            </section>

            <hr className="border-black/10" />

            {/* 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">3. The Services</h2>
              <p>The Services may include:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>website and purchasing features,</li>
                <li>mobile app features,</li>
                <li>device connectivity and cloud-based processing,</li>
                <li>
                  dashboards, insights, and alerts regarding pet activity, sleep-related indicators,
                  weight, and other metrics (as available).
                </li>
              </ul>
              <p>
                We may change, suspend, or discontinue any part of the Services at any time,
                including adding or removing features, without liability to you, except as required
                by law.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 4 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-black">
                4. Connected Devices; Data; Safety; Updates
              </h2>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">4.1 Device operation and environment</h3>
                <p>
                  Your device’s performance depends on many factors outside our control (e.g., Wi-Fi
                  reliability, Bluetooth range, power, placement, environment, firmware version, app
                  permissions, and pet behavior). You are responsible for maintaining compatible
                  devices, internet access, and any required settings.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">4.2 Data generated by devices</h3>
                <p>
                  Your use of the Services may generate data, including pet metrics (e.g., heart rate
                  indicators, respiratory rate indicators, weight, sleep-related indicators), device
                  diagnostics, and usage logs. Our collection and use of Personal Information is
                  described in our Privacy Policy at <Link to="/privacy" className="underline">/privacy</Link>{' '}
                  (implemented at src/pages/PrivacyPage). If there is a conflict between these Terms
                  and the Privacy Policy regarding privacy practices, the Privacy Policy controls.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">
                  4.3 Safety, electrical use, and pet behavior (Safety &amp; Misuse)
                </h3>
                <p>
                  Some WoafyPet devices may involve electricity, heating elements, power adapters, or
                  cables. You are responsible for reading and following all instructions, warnings,
                  and safety information provided with the device.
                </p>
                <p>
                  You are responsible for monitoring your pet’s interaction with the device. Pets
                  may chew, scratch, ingest components, pull cables, or cause liquid exposure
                  (including pet accidents). WoafyPet is not liable for damages or injuries caused
                  by pet behavior, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>chewing on cables or power cords,</li>
                  <li>ingestion of device components or materials,</li>
                  <li>puncture or tearing of device surfaces that exposes internal components,</li>
                  <li>
                    liquid exposure (e.g., urine, spills, cleaning fluids) that leads to electrical
                    malfunction, short-circuiting, overheating, or other damage, and
                  </li>
                  <li>
                    use of the device contrary to the instructions (including placement, cleaning,
                    ventilation, or power requirements).
                  </li>
                </ul>
                <p>
                  You agree to keep cables secured and out of reach where feasible, discontinue use
                  if components are damaged, and seek professional assistance if the device appears
                  unsafe (e.g., burning smell, smoke, overheating, exposed wiring, or abnormal
                  electrical behavior). Do not operate a damaged device.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">4.4 Automatic firmware and software updates</h3>
                <p>
                  To help maintain security, performance, reliability, feature improvements, and/or
                  compliance requirements, we may automatically update firmware or software for
                  connected devices and related Services. You agree to receive such updates. During
                  updates, the Services (or certain features) may be temporarily unavailable, and
                  device behavior or available features may change.
                </p>
              </div>
            </section>

            <hr className="border-black/10" />

            {/* 5 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">5. Purchases, Payment, and Taxes</h2>
              <p>
                If you purchase products through the Services, you agree to provide valid payment
                information and authorize us (and our payment processor) to charge your payment
                method for the total amount, including applicable taxes and shipping.
              </p>
              <p>
                All prices are shown in USD unless otherwise stated. You are responsible for any
                taxes that apply to your purchase unless otherwise indicated.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 6 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">6. Subscriptions</h2>
              <p>
                We may offer certain subscription features (including service plans, premium
                features, or other recurring offerings). If you subscribe, subscription fees,
                billing frequency, renewal terms, cancellation instructions, and any refund terms (if
                offered) will be disclosed at the time you subscribe.
              </p>
              <p>Unless otherwise required by law:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>subscriptions may automatically renew unless you cancel before renewal,</li>
                <li>
                  cancellation instructions will be provided at sign-up and/or within your account
                  settings (if available), and
                </li>
                <li>
                  pricing or included features may change with advance notice where required.
                </li>
              </ul>
              <p>
                Where required by law, we will provide required auto-renewal disclosures and a
                simple cancellation method.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 7 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-black">
                7. Shipping; Crowdfunding / Kickstarter
              </h2>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">7.1 Shipping and fulfillment</h3>
                <p>
                  Shipping timelines are estimates and not guaranteed. Title and risk of loss pass to
                  you upon delivery to the carrier. We are not responsible for delays or loss caused
                  by the carrier, inaccurate addresses provided by you, or events outside our
                  reasonable control.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">
                  7.2 Crowdfunding rewards (Kickstarter and similar platforms)
                </h3>
                <p>
                  For rewards pre-ordered through crowdfunding platforms (e.g., Kickstarter), you
                  acknowledge that delivery dates are estimates and not guarantees. We will use
                  commercially reasonable efforts to fulfill rewards, but we are not liable for
                  delays, and product specifications or timelines may change due to manufacturing,
                  supply chain, certification, or other factors.
                </p>
              </div>
            </section>

            <hr className="border-black/10" />

            {/* 8 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">
                8. User Conduct and Acceptable Use
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>misuse the Services, interfere with operation, or attempt unauthorized access,</li>
                <li>
                  reverse engineer, decompile, or attempt to extract source code except where
                  permitted by law,
                </li>
                <li>use the Services to violate laws or infringe others’ rights,</li>
                <li>upload malicious code, scrape, or disrupt infrastructure.</li>
              </ul>
              <p>We may suspend or terminate access if you violate these Terms.</p>
            </section>

            <hr className="border-black/10" />

            {/* 9 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">9. Intellectual Property</h2>
              <p>
                The Services (including software, firmware, designs, text, graphics, logos, and other
                content) are owned by WoafyPet or its licensors and are protected by intellectual
                property laws. You receive a limited, non-exclusive, non-transferable, revocable
                license to use the Services for personal, non-commercial use in accordance with
                these Terms.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 10 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">10. Feedback</h2>
              <p>
                If you submit feedback, suggestions, or ideas, you grant us the right to use them
                without restriction or compensation, and you represent you have the right to provide
                them.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 11 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-black">11. DISCLAIMERS</h2>
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <p className="font-semibold text-black">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICES AND PRODUCTS ARE PROVIDED “AS
                  IS” AND “AS AVAILABLE,” WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR
                  STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                  PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
              </div>
              <p>We do not warrant that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>the Services will be uninterrupted, timely, secure, or error-free,</li>
                <li>any insights, summaries, or alerts will be accurate or reliable,</li>
                <li>defects will be corrected.</li>
              </ul>
              <p>
                Some jurisdictions do not allow certain warranty disclaimers, so some of the above
                may not apply to you.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 12 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-black">12. LIMITATION OF LIABILITY</h2>
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <p className="font-semibold text-black">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WOAFYPET AND ITS AFFILIATES, OFFICERS,
                  EMPLOYEES, AGENTS, SUPPLIERS, AND LICENSORS WILL NOT BE LIABLE FOR ANY INDIRECT,
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS,
                  DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR
                  USE OF (OR INABILITY TO USE) THE SERVICES OR PRODUCTS.
                </p>
                <p className="mt-3 font-semibold text-black">
                  IN NO EVENT WILL OUR TOTAL LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICES OR
                  PRODUCTS EXCEED THE GREATER OF: (A) THE AMOUNT YOU PAID TO WOAFYPET FOR THE SERVICES
                  OR PRODUCT GIVING RISE TO THE CLAIM IN THE 12 MONTHS BEFORE THE EVENT, OR (B) $100.
                </p>
              </div>
              <p>
                Some jurisdictions do not allow limitations of liability, so some of the above may
                not apply to you.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 13 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">13. INDEMNIFICATION</h2>
              <p>
                You agree to indemnify and hold harmless WoafyPet and its affiliates, officers,
                employees, agents, suppliers, and licensors from and against any claims, liabilities,
                damages, losses, and expenses (including reasonable attorneys’ fees) arising from or
                related to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>your use of the Services,</li>
                <li>your violation of these Terms,</li>
                <li>your violation of applicable law, or</li>
                <li>your infringement of any rights of another party.</li>
              </ul>
            </section>

            <hr className="border-black/10" />

            {/* 14 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">14. Termination</h2>
              <p>
                We may suspend or terminate your access to the Services at any time if we reasonably
                believe you violated these Terms or if necessary to protect the Services, users, or
                our business. You may stop using the Services at any time.
              </p>
              <p>
                Sections that by their nature should survive termination will survive (including
                disclaimers, limitation of liability, indemnification, and dispute resolution).
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 15 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-black">
                15. Dispute Resolution; Arbitration; Class Action Waiver (OPTIONAL)
              </h2>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">15.1 Informal resolution</h3>
                <p>
                  Before filing a claim, you agree to contact us at support@woafmeow.com (Attn: Legal)
                  and provide a brief description of the issue and your contact information. The
                  parties will attempt to resolve the dispute informally within 30 days.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">15.2 Binding arbitration</h3>
                <p>
                  Except for small claims and injunctive relief for intellectual property, any
                  dispute arising out of or relating to these Terms or the Services will be resolved
                  by binding arbitration administered by the American Arbitration Association (“AAA”)
                  under its Consumer Arbitration Rules.
                </p>
                <p>
                  The arbitration will occur in Los Angeles County, California unless the parties
                  agree otherwise. The arbitration may be conducted by videoconference, telephone, or
                  based on written submissions, as permitted by the applicable rules.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">15.3 Class action waiver</h3>
                <p className="font-semibold text-black">
                  YOU AND WOAFYPET AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN AN
                  INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS
                  OR REPRESENTATIVE PROCEEDING.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-black">15.4 Opt-out</h3>
                <p>
                  You may opt out of arbitration within 30 days of first accepting these Terms by
                  emailing support@woafmeow.com with the subject line “Arbitration Opt-Out” and
                  including: (i) your full name, (ii) the email associated with your account (if
                  any), and (iii) a clear statement that you wish to opt out of arbitration.
                </p>
                <p>
                  We will send a confirmation email acknowledging receipt of a valid opt-out request,
                  and we will maintain a record of opt-out requests for compliance and dispute
                  administration purposes.
                </p>
              </div>
            </section>

            <hr className="border-black/10" />

            {/* 16 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">16. Governing Law; Venue (if not arbitrating)</h2>
              <p>
                These Terms are governed by the laws of the State of California, without regard to
                conflict of laws principles. If arbitration does not apply, you agree that any
                judicial proceedings will be brought in the state or federal courts located in Los
                Angeles County, California, and you consent to personal jurisdiction there.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 17 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">17. Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time. If we make material changes, we will
                provide notice by posting updated Terms and updating the “Last Updated” date, and/or
                by other means required by law. Your continued use of the Services after the
                effective date of updated Terms constitutes acceptance.
              </p>
            </section>

            <hr className="border-black/10" />

            {/* 18 */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-black">18. Contact</h2>
              <p>
                WoafMeow Inc.
                <br />
                19756 Saddlecrest Drive, Walnut, CA 91789, USA
                <br />
                Email: support@woafmeow.com
              </p>
            </section>
          </div>
        </Card>
      </div>
    </Section>
  );
}