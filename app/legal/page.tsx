export const metadata = {
  title: "Terms of Service & Privacy Policy | poodles.dog",
  description: "Terms of Service and Privacy Policy for poodles.dog",
};

export default function LegalPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-2">Legal</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: [DATE]</p>

      <nav className="mb-10 p-4 bg-gray-50 rounded-lg text-sm">
        <p className="font-semibold mb-2">On this page:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li><a href="#tos" className="text-blue-600 hover:underline">Terms of Service</a></li>
          <li><a href="#privacy" className="text-blue-600 hover:underline">Privacy Policy</a></li>
        </ul>
      </nav>

      {/* ========================================================== */}
      {/* TERMS OF SERVICE */}
      {/* ========================================================== */}
      <section id="tos" className="mb-16">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Terms of Service</h2>

        <div className="space-y-6 text-sm leading-relaxed">
          <div>
            <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
            <p>
              By accessing or using poodles.dog (the &quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;),
              you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do
              not agree to these Terms, you must not access or use the Platform.
              The Platform is operated from Cyprus, a member state of the European
              Union. You can reach us at <strong>legal@poodles.dog</strong> for any
              legal notice, question, or request related to these Terms.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">2. What poodles.dog Is</h3>
            <p>
              poodles.dog is an online classifieds and listings platform that
              allows registered breeders to publish listings for puppies and
              dogs, and allows buyers to search, view, and contact breeders
              directly. <strong>We are not a party to any transaction between a
              breeder and a buyer.</strong> We do not sell, own, breed, transport,
              inspect, or take possession of any animal at any point, and we do
              not process any payment between users. We do not act as an agent,
              broker, escrow service, or intermediary in any sale. All
              communication, negotiation, payment, contract, and transfer of an
              animal happens directly and exclusively between the breeder and
              the buyer, entirely at their own risk and responsibility.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">3. Eligibility</h3>
            <p>
              You must be at least 18 years old to create an account or use the
              Platform. By registering, you represent and warrant that all
              information you provide is accurate, current, and complete, and
              that you have full legal capacity and the legal right, under the
              laws applicable to you, to enter into transactions related to the
              breeding, sale, purchase, or ownership of animals. We may refuse
              service, suspend, or terminate any account at our sole discretion.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">4. Account Types &amp; Registration</h3>
            <p>
              The Platform offers two account roles: <strong>Buyer</strong>{" "}
              (browse, search, save favorites, contact breeders, set up alerts)
              and <strong>Breeder</strong> (all buyer features, plus the ability
              to publish listings). You are responsible for maintaining the
              confidentiality of your account credentials and for all activity
              that occurs under your account. We reserve the right to request
              verification of your role, identity, or claims at any time, and
              to reclassify, suspend, or delete accounts that misrepresent
              their role or provide false information.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">5. Breeder Responsibilities &amp; Warranties</h3>
            <p className="mb-2">
              If you publish listings on the Platform, you represent, warrant,
              and agree that:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                You are solely and fully responsible for complying with all
                laws, licensing requirements, animal welfare regulations,
                breeding restrictions, tax obligations, and advertising rules
                applicable to breeding, advertising, and selling animals in
                your country, region, and the buyer&apos;s country, where
                applicable. Requirements vary significantly by jurisdiction
                worldwide, and it is your sole responsibility to know and
                comply with them. The Platform provides no legal advice and
                makes no representation that any listing complies with any
                specific jurisdiction&apos;s laws.
              </li>
              <li>
                All information in your listing is accurate, current, and
                truthful, including the animal&apos;s age, breed, health
                status, vaccination and deworming history, temperament,
                pedigree status, and price.
              </li>
              <li>
                You will not list, offer, or advertise any animal younger than
                the minimum age permitted for sale under the laws applicable
                to you. As a general Platform policy, and regardless of local
                minimums, we do not permit listings for puppies under 8 weeks
                of age under any circumstances.
              </li>
              <li>
                You hold, where required by your jurisdiction, any applicable
                breeder license, registration, permit, or authorization
                necessary to breed and sell the animal, and you will provide
                such documentation to a buyer or to us upon reasonable
                request.
              </li>
              <li>
                The animal has not been subjected to mutilation, cruelty, or
                neglect, and is kept and bred in conditions consistent with
                its physical and behavioral welfare needs.
              </li>
              <li>
                Photos and videos you upload are your own original content, or
                you hold the necessary rights and permissions to use them, and
                they accurately and currently depict the specific animal being
                listed (not stock photos or photos of a different animal).
              </li>
              <li>
                You will not use the Platform to advertise mating, stud
                services, or breeding arrangements between third-party
                animals.
              </li>
              <li>
                You are solely responsible for any warranty, health guarantee,
                contract, deposit, or refund policy you offer to a buyer. The
                Platform is not a party to and has no responsibility for any
                such arrangement.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">6. Buyer Responsibilities &amp; Assumption of Risk</h3>
            <p className="mb-2">As a buyer, you acknowledge and agree that:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                You are solely responsible for independently verifying any
                claim made in a listing (health, pedigree, licensing,
                vaccination records, identity of the seller) directly with the
                breeder, and for conducting any due diligence you consider
                necessary (including requesting veterinary records, visiting
                in person, or requesting identification/licensing documents)
                before completing any transaction or making any payment.
              </li>
              <li>
                Purchasing, importing, transporting, or owning an animal may
                be subject to laws, permits, quarantine rules, customs
                requirements, or veterinary requirements in your country. You
                are solely responsible for complying with these.
              </li>
              <li>
                The Platform does not inspect, verify, license-check,
                background-check, or guarantee the health, temperament, breed
                authenticity, legal right to sell, or trustworthiness of any
                animal or breeder listed on the Platform.
              </li>
              <li>
                Any payment, deposit, or transfer of funds you make to a
                breeder is made directly to that breeder, at your own risk.
                The Platform never collects, holds, or processes payment for
                the sale of an animal, and has no ability to reverse, refund,
                or mediate such a payment.
              </li>
              <li>
                You will communicate respectfully with breeders. Harassment,
                abusive language, threats, or spam sent through the
                Platform&apos;s messaging or inquiry system may result in
                account suspension or termination.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">7. Prohibited Content &amp; Conduct</h3>
            <p className="mb-2">You may not use the Platform to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>List, advertise, or facilitate the sale of an animal obtained, bred, kept, or transported in violation of any applicable animal welfare, anti-cruelty, or trafficking law.</li>
              <li>Post false, misleading, deceptive, or &quot;bait&quot; listings, including price manipulation, fake availability, or photos that do not depict the actual animal.</li>
              <li>Advertise animal fighting, sale for fighting purposes, sexual content involving animals, or any other unlawful activity.</li>
              <li>Impersonate another person, misrepresent your affiliation with a breeder, kennel, club, or organization, or create a false or duplicate account.</li>
              <li>Upload content that infringes another party&apos;s intellectual property, publicity, or privacy rights, or that you do not have the right to use.</li>
              <li>Scrape, harvest, crawl, or use automated means to extract data, listings, or user information from the Platform.</li>
              <li>Use the contact/inquiry system to send unsolicited advertising, phishing attempts, or content unrelated to a specific listing.</li>
              <li>Upload malicious code, attempt to breach Platform security, or interfere with the normal operation of the Platform.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">8. Content You Submit</h3>
            <p>
              You retain ownership of the text, photos, and other content you
              submit (&quot;User Content&quot;). By submitting User Content, you grant
              the Platform a non-exclusive, worldwide, royalty-free,
              sublicensable license to host, store, display, reproduce,
              adapt (e.g. resize for thumbnails), and distribute it for the
              purpose of operating, promoting, and improving the Platform
              (including in search results, featured listings sections, and
              marketing materials). You are solely responsible for your User
              Content and confirm you have all necessary rights, consents, and
              permissions to submit it. We may remove any User Content at our
              sole discretion, at any time, without notice.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">9. Reporting, Moderation &amp; Enforcement</h3>
            <p>
              Users may report listings or accounts they believe violate these
              Terms using the &quot;Report this listing&quot; feature or by emailing{" "}
              <strong>legal@poodles.dog</strong>. We review reports at our
              discretion and may remove, edit, or restrict content, and may
              suspend or permanently terminate accounts that violate these
              Terms, with or without prior notice and without liability to
              you. We do not guarantee any specific review timeline. Reviewing,
              approving, or failing to act on a report does not constitute an
              admission of fault, endorsement, or acceptance of liability by
              the Platform.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">10. No Verification, No Endorsement, No Warranty</h3>
            <p>
              The Platform does not independently verify breeder licenses,
              animal health records, pedigree certificates, identity
              documents, or any other claim made in a listing or account,
              unless explicitly and specifically stated otherwise in writing.
              Approval or publication of a listing by us means only that it
              appeared, at the time of review, to meet our basic content
              guidelines — it is <strong>not</strong> a certification,
              verification, endorsement, or guarantee of the breeder, the
              animal, or the accuracy of any claim contained in the listing.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">11. Disclaimer of Warranties</h3>
            <p>
              THE PLATFORM AND ALL CONTENT, LISTINGS, AND FEATURES ARE PROVIDED
              &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;, WITHOUT WARRANTIES OF ANY KIND,
              WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED
              TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, OR
              UNINTERRUPTED/ERROR-FREE OPERATION. WE DO NOT WARRANT THAT ANY
              LISTING, USER, OR ANIMAL DESCRIBED ON THE PLATFORM IS ACCURATE,
              SAFE, LEGAL, OR AS DESCRIBED. NOTHING IN THESE TERMS EXCLUDES OR
              LIMITS ANY WARRANTY OR RIGHT THAT CANNOT LAWFULLY BE EXCLUDED OR
              LIMITED UNDER THE LAWS APPLICABLE TO YOU, INCLUDING MANDATORY
              CONSUMER PROTECTION RIGHTS IN THE EUROPEAN UNION AND ELSEWHERE.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">12. Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE PLATFORM,
              ITS OPERATOR, AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR
              PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR
              OTHER INTANGIBLE LOSSES, ARISING FROM OR RELATED TO: (A) YOUR USE
              OF OR INABILITY TO USE THE PLATFORM; (B) ANY TRANSACTION,
              COMMUNICATION, OR DISPUTE BETWEEN A BREEDER AND A BUYER; (C) THE
              HEALTH, CONDUCT, LEGALITY, OR CHARACTERISTICS OF ANY ANIMAL
              LISTED OR SOLD THROUGH THE PLATFORM; (D) ANY CONTENT POSTED BY
              ANY USER; OR (E) UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR
              DATA. IN NO EVENT SHALL THE PLATFORM&apos;S TOTAL AGGREGATE
              LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE
              PLATFORM EXCEED FIFTY EUROS (€50) OR THE AMOUNT YOU PAID US, IF
              ANY, IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, WHICHEVER IS
              GREATER. THIS SECTION DOES NOT LIMIT LIABILITY FOR DEATH OR
              PERSONAL INJURY CAUSED BY OUR NEGLIGENCE, FRAUD, OR ANY OTHER
              LIABILITY THAT CANNOT BE EXCLUDED UNDER APPLICABLE LAW.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">13. Indemnification</h3>
            <p>
              You agree to defend, indemnify, and hold harmless the Platform,
              its operator, and its affiliates from and against any claims,
              liabilities, damages, losses, and expenses, including reasonable
              legal fees, arising out of or in any way connected with: (a)
              your access to or use of the Platform; (b) your User Content;
              (c) your violation of these Terms; (d) your violation of any
              law, regulation, or third-party right, including any animal
              welfare, licensing, consumer protection, or intellectual
              property law; or (e) any transaction, dispute, or communication
              between you and another user.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">14. Intellectual Property</h3>
            <p>
              The Platform&apos;s name, logo, design, software, and all
              underlying technology are owned by us or our licensors and are
              protected by intellectual property laws. You may not copy,
              modify, distribute, or create derivative works based on the
              Platform without our prior written consent. If you believe your
              copyrighted work has been infringed by content on the Platform,
              contact <strong>legal@poodles.dog</strong> with a description of
              the work, the infringing content&apos;s location, and your
              contact details, and we will investigate and remove infringing
              content where appropriate.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">15. Suspension &amp; Termination</h3>
            <p>
              We may suspend or terminate your account or access to the
              Platform at any time, with or without cause or notice, including
              for violation of these Terms, suspected fraud, or conduct we
              consider harmful to other users, animals, or the Platform. You
              may stop using the Platform and request deletion of your account
              at any time. Sections of these Terms that by their nature should
              survive termination (including Sections 10-14 and 16-18) will
              survive.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">16. Changes to the Platform &amp; These Terms</h3>
            <p>
              We may modify, suspend, or discontinue any part of the Platform
              at any time. We may update these Terms from time to time; the
              &quot;Last updated&quot; date at the top reflects the latest revision.
              Continued use of the Platform after changes take effect
              constitutes acceptance of the revised Terms. If changes are
              material, we will make reasonable efforts to notify registered
              users (e.g. by email or a notice on the Platform).
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">17. Governing Law &amp; Dispute Resolution</h3>
            <p>
              These Terms are governed by the laws of the Republic of Cyprus,
              without regard to its conflict-of-law principles, except where
              mandatory consumer protection laws of your country of residence
              require the application of a different law for disputes with
              consumers, in which case those mandatory rules will apply to the
              extent required. Any dispute arising from or related to these
              Terms or the Platform that cannot be resolved informally shall
              be subject to the exclusive jurisdiction of the competent courts
              of Cyprus, without prejudice to any mandatory right you may have
              to bring proceedings in the courts of your own country of
              residence under applicable consumer protection law. If you are
              an EU consumer, you may also be able to use the EU Online
              Dispute Resolution platform at{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                className="text-blue-600 hover:underline"
              >
                ec.europa.eu/consumers/odr
              </a>.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">18. General Provisions</h3>
            <p>
              If any provision of these Terms is found unenforceable, the
              remaining provisions will remain in full force and effect. Our
              failure to enforce any provision is not a waiver of our right to
              do so later. These Terms, together with the Privacy Policy
              below, constitute the entire agreement between you and the
              Platform regarding your use of the Platform. You may not assign
              or transfer these Terms; we may assign them freely in connection
              with a merger, acquisition, or sale of assets.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* PRIVACY POLICY */}
      {/* ========================================================== */}
      <section id="privacy">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Privacy Policy</h2>

        <div className="space-y-6 text-sm leading-relaxed">
          <div>
            <h3 className="font-semibold text-base mb-2">1. Who We Are</h3>
            <p>
              This Privacy Policy explains how poodles.dog (&quot;we&quot;, &quot;us&quot;,
              &quot;the Platform&quot;), operated from Cyprus, collects, uses, shares,
              and protects your personal data when you use our website. For
              any privacy-related question or to exercise your rights, contact
              us at <strong>privacy@poodles.dog</strong>. If you are located in
              the European Economic Area, you also have the right to lodge a
              complaint with your local data protection authority, including
              the Office of the Commissioner for Personal Data Protection of
              Cyprus (
              <a
                href="https://www.dataprotection.gov.cy"
                className="text-blue-600 hover:underline"
              >
                dataprotection.gov.cy
              </a>
              ).
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">2. What Data We Collect</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Account data:</strong> display name, email address, password (encrypted), account role (buyer/breeder).</li>
              <li><strong>Profile &amp; listing data:</strong> kennel name, phone number, listing details, photos, location data you provide.</li>
              <li><strong>Communications:</strong> messages sent through the inquiry system, reports you submit, emails you send us.</li>
              <li><strong>Alert preferences:</strong> email address, size/sex/colour/location filters, if you sign up for listing alerts.</li>
              <li><strong>Usage data:</strong> pages visited, search filters used, favorites saved, login timestamps, IP address, browser/device information.</li>
              <li><strong>Cookies:</strong> essential cookies for authentication/session management; we do not currently use third-party advertising or tracking cookies.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">3. How We Use Your Data</h3>
            <p className="mb-2">We process your personal data to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create and manage your account, and authenticate your login (including sending OTP confirmation codes).</li>
              <li>Display listings, enable search and filtering, and connect buyers with breeders.</li>
              <li>Deliver inquiry messages, listing alerts, and important account/service notifications by email.</li>
              <li>Detect, investigate, and prevent fraud, abuse, illegal listings, and violations of our Terms of Service.</li>
              <li>Maintain the security and proper functioning of the Platform.</li>
              <li>Comply with legal obligations and respond to lawful requests from authorities.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">4. Legal Basis for Processing (GDPR)</h3>
            <p>
              Where the EU General Data Protection Regulation (GDPR) applies,
              we rely on the following legal bases: performance of a contract
              (to provide the Platform&apos;s core features to you); legitimate
              interests (to keep the Platform secure, prevent fraud, and
              improve our services); consent (for optional listing alerts and
              any optional marketing you sign up for, which you may withdraw
              at any time); and legal obligation (where we must retain or
              disclose data to comply with the law).
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">5. Who We Share Data With</h3>
            <p className="mb-2">
              We do not sell your personal data. We share data only with the
              following categories of recipients, strictly to operate the
              Platform:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Supabase</strong> — our database and authentication provider, which stores account, profile, and listing data.</li>
              <li><strong>Vercel</strong> — our hosting provider, which serves the website and processes technical/traffic data.</li>
              <li><strong>Resend</strong> — our transactional email provider, used to deliver confirmation codes, inquiry notifications, and listing alerts.</li>
              <li><strong>Other users</strong> — when you contact a breeder or a breeder responds to your inquiry, the necessary contact details are shared between you to allow the transaction to proceed; breeder listing information is publicly visible to all visitors by design.</li>
              <li><strong>Authorities</strong> — where required to comply with a legal obligation, court order, or to protect the rights, safety, or property of the Platform, our users, or the public.</li>
            </ul>
            <p className="mt-2">
              These providers may process data outside the European Economic
              Area (e.g. in the United States). Where this occurs, we rely on
              appropriate safeguards, such as Standard Contractual Clauses, as
              required under GDPR.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">6. Data Retention</h3>
            <p>
              We retain your account data for as long as your account is
              active. If you delete your account, we delete or anonymize your
              personal data within a reasonable period, except where we are
              required to retain certain data (e.g. records of reports,
              banned accounts, or transaction-related communications) for
              longer to comply with legal obligations, resolve disputes, or
              prevent fraud and abuse. Listing alert subscriptions are
              retained until you unsubscribe.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">7. Your Rights</h3>
            <p className="mb-2">
              Subject to applicable law, and in particular if you are located
              in the European Economic Area, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate or incomplete data.</li>
              <li>Request deletion of your data (&quot;right to be forgotten&quot;), subject to legal retention obligations.</li>
              <li>Object to or restrict certain processing, including processing based on legitimate interests.</li>
              <li>Request a portable copy of your data.</li>
              <li>Withdraw consent at any time where processing is based on consent (e.g. listing alerts).</li>
              <li>Lodge a complaint with your local data protection authority.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, email{" "}
              <strong>privacy@poodles.dog</strong>. If you are located outside
              the EEA, we will make reasonable efforts to honor equivalent
              rights under the law applicable to you.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">8. Children&apos;s Privacy</h3>
            <p>
              The Platform is not directed at, and we do not knowingly collect
              personal data from, individuals under 18 years of age. If we
              become aware that we have collected personal data from a minor
              without appropriate consent, we will delete it promptly. If you
              believe a minor has provided us with personal data, contact{" "}
              <strong>privacy@poodles.dog</strong>.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">9. Data Security</h3>
            <p>
              We use reasonable technical and organizational measures to
              protect your data, including encrypted password storage,
              access-controlled databases, and row-level security policies.
              However, no method of transmission or storage is 100% secure,
              and we cannot guarantee absolute security. In the event of a
              data breach affecting your personal data, we will notify
              affected users and relevant authorities as required by
              applicable law.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">10. International Users</h3>
            <p>
              The Platform is accessible worldwide. Regardless of where you
              access it from, your data will be processed as described in
              this Policy, with our operations based in Cyprus (EU) and
              service providers as listed in Section 5. By using the
              Platform, you consent to this processing, including any
              transfer of data outside your own country.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">11. Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. The
              &quot;Last updated&quot; date at the top of this page reflects the
              latest revision. Material changes will be communicated to
              registered users by email or a notice on the Platform where
              appropriate.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">12. Contact</h3>
            <p>
              For any question about this Privacy Policy or our Terms of
              Service, contact us at{" "}
              <strong>legal@poodles.dog</strong> (Terms) or{" "}
              <strong>privacy@poodles.dog</strong> (Privacy/data requests).
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
