import React from "react";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <section>
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    {children}
  </section>
);

const Item = ({ title, children }) => (
  <li>
    <strong>{title}:</strong> {children}
  </li>
);

export default function PrivacyPolicy() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <header className="mb-8">
        <p className="text-blue-600 font-semibold">AfricSocial</p>

        <h1 className="text-3xl font-bold mt-2">
          Privacy Policy
        </h1>

        <p className="text-sm text-gray-500 mt-2">
          Last updated: 31 October 2026
        </p>

        <p className="text-sm text-gray-600 mt-3">
          Platform status: Under development. AfricSocial has not yet
          launched publicly.
        </p>
      </header>

      <div className="space-y-7 leading-7">

        <Section title="1. Introduction and Organisation">
          <p>
            AfricSocial is a social networking platform being developed
            to help people connect, communicate, share content, discover
            opportunities and participate in digital communities.
          </p>

          <p className="mt-2">
            The proposed organisation responsible for operating
            AfricSocial is AfricSocial Technologies Limited, whose
            incorporation with the Corporate Affairs Commission of
            Nigeria is in progress. Until incorporation is completed,
            the legal identity and responsibilities of the operating
            organisation will be updated where necessary.
          </p>

          <p className="mt-2">
            This Privacy Policy explains how personal information may
            be collected, used, stored, disclosed, protected and
            deleted when people visit, register for, test or use
            AfricSocial.
          </p>

          <p className="mt-2">
            This policy is intended to apply to development and testing
            activities where personal information is processed and to
            the platform when it becomes publicly available. Some
            features described below are planned and may not yet be
            operational.
          </p>

          <p className="mt-2">
            Our privacy practices are intended to comply with the
            Nigeria Data Protection Act 2023 and other applicable
            data-protection laws.
          </p>
        </Section>

        <Section title="2. Information We May Collect">
          <p>
            The information collected will depend on the features
            available, the activities you undertake and the information
            you choose to provide.
          </p>

          <ul className="list-disc pl-6 mt-3 space-y-2">
            <Item title="Account information">
              Name, email address, phone number, username, date of
              birth or age information, authentication information
              and account preferences.
            </Item>

            <Item title="Profile information">
              Profile photographs, biography, interests, profile
              details and other information you choose to display.
            </Item>

            <Item title="User-generated content">
              Photographs, videos, posts, reels, stories, comments,
              reactions and other content you upload or publish.
            </Item>

            <Item title="Communications">
              Messages, support requests and other communications
              made through features you use. Where messaging, voice
              calls or video calls are available, relevant technical
              information may also be processed to provide those
              services.
            </Item>

            <Item title="Device and technical information">
              IP address, device type, operating system, browser
              information, application version, diagnostic records,
              connection information, security logs and technical
              identifiers, where collected.
            </Item>

            <Item title="Usage and interaction information">
              Information about how you interact with profiles,
              content, groups, pages, recommendations and other
              platform features.
            </Item>

            <Item title="Financial and transaction information">
              Wallet activity, transaction references, payment
              status, creator earnings, marketplace transactions,
              advertiser payments, payout information and related
              financial records, where applicable.
            </Item>

            <Item title="Verification information">
              Information reasonably necessary to verify accounts,
              creators, businesses, sellers, advertisers or other
              eligible users.
            </Item>

            <Item title="Support and correspondence">
              Information you provide when contacting our support
              or privacy teams.
            </Item>
          </ul>

          <p className="mt-3">
            We will seek to collect information that is relevant
            and reasonably necessary for the purposes explained
            in this policy.
          </p>
        </Section>

        <Section title="3. Information from Other Sources">
          <p>
            Where appropriate and permitted by law, we may receive
            information from payment providers, verification
            providers, security services, business partners or
            other service providers.
          </p>

          <p className="mt-2">
            We may also receive information when another user
            mentions you, shares content with you or interacts
            with your publicly available profile or content.
          </p>
        </Section>

        <Section title="4. How We Use Personal Information">
          <p>Depending on the features you use, information may be used to:</p>

          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Create, authenticate and maintain user accounts.</li>
            <li>Display profiles and deliver content requested by users.</li>
            <li>Enable messaging and other communication features.</li>
            <li>Operate social feeds, groups, pages and communities.</li>
            <li>Provide marketplace and business-related services.</li>
            <li>Manage applicable payments, wallets, earnings and payouts.</li>
            <li>Provide creator, advertiser and monetisation services.</li>
            <li>Verify accounts and prevent impersonation.</li>
            <li>Protect users and the platform against fraud, abuse and security threats.</li>
            <li>Respond to enquiries, complaints and support requests.</li>
            <li>Understand platform performance and improve functionality.</li>
            <li>Provide recommendations and relevant content.</li>
            <li>Meet legal, regulatory and financial obligations.</li>
          </ul>
        </Section>

        <Section title="5. Lawful Bases for Processing">
          <p>
            We will process personal information only where an
            applicable lawful basis permits us to do so.
            Depending on the circumstances, these bases may include:
          </p>

          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>Consent:</strong> Where you have freely and
              specifically agreed to a particular processing activity.
            </li>

            <li>
              <strong>Contract:</strong> Where processing is necessary
              to provide a service you request or fulfil an agreement
              with you.
            </li>

            <li>
              <strong>Legal obligation:</strong> Where processing is
              necessary to comply with applicable laws or lawful
              regulatory requirements.
            </li>

            <li>
              <strong>Legitimate interests:</strong> Where we have
              a lawful and proportionate interest, provided that
              your rights and freedoms are appropriately protected.
            </li>

            <li>
              <strong>Vital interests or other lawful grounds:</strong>
              Where processing is permitted under applicable law
              to protect individuals or serve another recognised
              lawful purpose.
            </li>
          </ul>

          <p className="mt-3">
            Where consent is required, you may withdraw it.
            Withdrawal does not affect processing lawfully carried
            out before withdrawal.
          </p>
        </Section>

        <Section title="6. Public Content and Sharing">
          <p>
            Content you choose to publish publicly may be visible
            to other users and, depending on platform settings,
            people who are not registered members.
          </p>

          <p className="mt-2">
            Other users may copy, download, screenshot, share or
            otherwise redistribute publicly available content.
            Removing content from AfricSocial may not remove copies
            already made or shared by other people.
          </p>

          <p className="mt-2">
            Please avoid publishing information you do not want
            others to see. Privacy settings and feature availability
            may affect who can access particular content.
          </p>

          <p className="mt-2">
            We do not sell users' personal information to advertisers.
            We may disclose information to service providers or other
            recipients where necessary for requested services,
            security, legal compliance or another lawful purpose.
          </p>
        </Section>

        <Section title="7. Messages, Voice Calls and Video Calls">
          <p>
            Where communication features are available, information
            may be processed to deliver messages, establish
            connections, maintain communication records where
            necessary and protect the service against abuse.
          </p>

          <p className="mt-2">
            Communication information may include sender and recipient
            details, timestamps, delivery information, connection
            records and technical metadata.
          </p>

          <p className="mt-2">
            We will explain any applicable recording, storage or
            monitoring practices before introducing features that
            involve recording or additional processing of communication
            content. Do not assume that a call or message is
            end-to-end encrypted unless the relevant feature
            expressly confirms this.
          </p>
        </Section>

        <Section title="8. AI, Recommendations and Automated Processing">
          <p>
            AfricSocial may use automated systems and artificial
            intelligence to organise feeds, recommend content,
            improve discovery, identify suspicious activity,
            moderate content and improve platform functionality.
          </p>

          <p className="mt-2">
            These systems may use information such as interactions,
            content preferences, account activity and technical
            signals, where lawful and necessary.
          </p>

          <p className="mt-2">
            Where automated processing is used, we will apply
            appropriate safeguards. Where applicable law gives
            you the right to request human intervention, express
            your views or challenge a decision based solely on
            automated processing, you may exercise that right.
          </p>

          <p className="mt-2">
            We will provide additional information where a particular
            automated decision has legal or similarly significant
            effects on you.
          </p>
        </Section>

        <Section title="9. Advertising and Marketing">
          <p>
            AfricSocial may provide advertising and promotional
            services to businesses and advertisers.
          </p>

          <p className="mt-2">
            Where advertising features are introduced, we may use
            permitted information to measure campaign performance,
            prevent advertising fraud, manage campaigns and display
            relevant promotional content.
          </p>

          <p className="mt-2">
            We will obtain consent where required for direct
            marketing or other processing activities that require
            consent. You will be able to exercise applicable
            marketing and privacy choices.
          </p>

          <p className="mt-2">
            We do not promise that advertising, profiling or
            recommendation features described here are already
            active.
          </p>
        </Section>

        <Section title="10. Payments, Wallets and Financial Information">
          <p>
            If wallet, marketplace, creator monetisation, advertising
            or payment features are available, we may process
            information necessary to manage transactions and
            financial obligations.
          </p>

          <p className="mt-2">
            This may include transaction references, payment
            confirmations, account balances, creator earnings,
            payout details, refunds, disputes and records required
            for accounting or legal purposes.
          </p>

          <p className="mt-2">
            Payments may be handled by third-party payment providers.
            Those providers may independently process information
            under their own privacy policies and legal obligations.
          </p>

          <p className="mt-2">
            We will not request or store payment card security
            information unless the relevant payment arrangement
            lawfully requires and supports such processing.
          </p>
        </Section>

        <Section title="11. Service Providers and Third Parties">
          <p>
            AfricSocial may rely on third-party providers for
            infrastructure, hosting, databases, file storage,
            content delivery, email delivery, payment processing,
            analytics, security, verification and other technical
            services.
          </p>

          <p className="mt-2">
            These providers may process personal information
            on our behalf under appropriate arrangements and
            instructions, where applicable.
          </p>

          <p className="mt-2">
            We may also disclose information where necessary
            to comply with law, respond to valid legal requests,
            protect users, investigate suspected fraud or
            enforce our rights.
          </p>

          <p className="mt-2">
            We do not authorise service providers acting on our
            behalf to use personal information for purposes
            unrelated to their agreed services unless permitted
            by law.
          </p>
        </Section>

        <Section title="12. International Data Transfers">
          <p>
            Some infrastructure and service providers may operate
            outside Nigeria. As a result, personal information
            may be processed or stored in other countries.
          </p>

          <p className="mt-2">
            Where personal information is transferred internationally,
            we will apply the safeguards and legal requirements
            applicable to that transfer, which may include
            adequacy protections, contractual safeguards or
            other permitted transfer mechanisms.
          </p>

          <p className="mt-2">
            Where required, we will provide additional information
            about relevant transfers and safeguards.
          </p>
        </Section>

        <Section title="13. Cookies and Similar Technologies">
          <p>
            Our website or application may use cookies, local
            storage, device identifiers or similar technologies
            to support essential functions, security, preferences
            and, where enabled, analytics or other optional features.
          </p>

          <p className="mt-2">
            Where consent is required, we will request it before
            using the relevant technology. You may be able to
            manage certain preferences through your browser,
            device or available platform settings.
          </p>

          <p className="mt-2">
            Disabling essential technologies may affect some
            platform functionality.
          </p>
        </Section>

        <Section title="14. Data Security">
          <p>
            We intend to use reasonable technical and organisational
            measures to protect personal information against
            unauthorised access, loss, misuse, alteration,
            disclosure or destruction.
          </p>

          <p className="mt-2">
            Measures may include access controls, authentication,
            encryption where appropriate, security monitoring,
            backups and procedures for managing incidents.
          </p>

          <p className="mt-2">
            No internet transmission or electronic storage
            method can be guaranteed to be completely secure.
            Users should protect their login credentials and
            report suspected account compromise promptly.
          </p>
        </Section>

 <Section title="15. Data Retention">
  <p>
    We retain personal information only for as long as
    reasonably necessary for the purposes for which
    it was collected, subject to applicable legal
    requirements.
  </p>

  <p className="mt-2">
    Retention periods may depend on the type of information,
    the service involved, account status, security needs,
    disputes and applicable legal, regulatory or financial
    obligations.
  </p>

  <p className="mt-2">
    Account information and user-generated content may be
    retained while an account remains active and for an
    appropriate period afterwards where necessary for
    legitimate operational, security, legal or dispute-
    resolution purposes.
  </p>

  <p className="mt-2">
    Financial information, including transaction records,
    wallet activity, creator earnings, outstanding balances
    and pending payouts, may be retained for the period
    required by applicable legal, accounting, regulatory
    and dispute-resolution obligations.
  </p>

  <p className="mt-2">
    Where an account deletion request is submitted, we will
    handle outstanding financial matters and pending
    transactions before completing the deletion process.
    Only the minimum financial information necessary for
    applicable legal, accounting or dispute-resolution
    purposes will be retained.
  </p>

  <p className="mt-2">
    Some information may remain temporarily in backups,
    security records or technical systems where immediate
    removal is not reasonably practicable. Such information
    will be subject to appropriate safeguards and removed
    in accordance with applicable retention procedures.
  </p>

  <p className="mt-2">
    Where information is no longer required, we will take
    appropriate steps to delete, anonymise or securely
    dispose of it, subject to lawful retention requirements.
  </p>
</Section>

        <Section title="16. Account Deletion">
          <p>
            Users may request deletion of their AfricSocial
            accounts through the account deletion process
            provided on the platform.
          </p>

          <p className="mt-2">
            A deletion request is not the same as completed
            deletion. We may need to verify your identity,
            review the request and complete necessary
            processing before confirming deletion.
          </p>

          <p className="mt-2">
            Where the applicable account deletion process
            provides a 30-day cancellation period, you may
            cancel an eligible pending request within that
            period. The availability of cancellation is
            subject to the status of the request and the
            applicable process.
          </p>

          <p className="mt-2">
  Once an account deletion request becomes pending,
  new wallet transactions will be blocked to prevent
  additional financial obligations from arising
  during the deletion process. Necessary processing
  of existing balances, pending payouts, refunds or
  other outstanding financial matters may continue
  where required to complete the deletion process.
</p>

          <p className="mt-2">
            We may review outstanding wallet balances,
            pending payouts, creator earnings, refunds,
            disputes and other financial obligations.
            These matters may need to be resolved or
            referred for review before deletion is completed.
          </p>

          <p className="mt-2">
            We may retain the minimum financial, transaction,
            security and legal records required to meet
            applicable accounting, regulatory, dispute
            resolution or other legal obligations.
            Unnecessary personal information will be
            deleted or otherwise handled appropriately
            where permitted by law.
          </p>

          <p className="mt-2">
            We will not represent a deletion request as
            completed until the required financial handling
            and applicable data-cleanup processes have
            been completed.
          </p>

          <p className="mt-3">
            <Link
              to="/delete-account"
              className="text-blue-600 underline font-medium"
            >
              Read how to request account deletion
            </Link>
          </p>
        </Section>

        <Section title="17. Your Privacy Rights">
          <p>
            Subject to applicable law, you may have the right to:
          </p>

          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Be informed about how your personal information is processed.</li>
            <li>Request access to your personal information.</li>
            <li>Request correction of inaccurate or incomplete information.</li>
            <li>Request deletion of personal information where legally available.</li>
            <li>Request restriction of certain processing activities.</li>
            <li>Object to certain processing activities.</li>
            <li>Withdraw consent where processing is based on consent.</li>
            <li>Request data portability where applicable.</li>
            <li>Challenge certain decisions based solely on automated processing.</li>
            <li>Lodge a complaint with the relevant data-protection authority.</li>
          </ul>

          <p className="mt-3">
            To exercise your rights, contact
            privacy@africsocial.com. We may request reasonable
            information to verify your identity before responding.
          </p>

          <p className="mt-2">
            We will respond within the time limits required
            by applicable law. Some requests may be restricted
            where a lawful exception applies.
          </p>
        </Section>

        <Section title="18. Children's Privacy and Minimum Age">
          <p>
            AfricSocial is intended for users aged 13 and above.
            People below 13 years of age must not create or
            use an account.
          </p>

          <p className="mt-2">
            Users aged 13 to 17 are children for purposes of
            applicable Nigerian child-protection and data-protection
            laws. Their personal information requires appropriate
            safeguards.
          </p>

          <p className="mt-2">
            Where parental or legal guardian consent is required
            under applicable law, we will obtain and verify
            that consent before relying on it. We may apply
            appropriate age-verification and consent-verification
            measures.
          </p>

          <p className="mt-2">
  The processing of personal information relating to
  users aged 13 and above in connection with electronic
  services will comply with section 31 of the Nigeria
  Data Protection Act 2023, applicable regulations and
  relevant child-protection laws. The provision relating
  to children aged 13 and above requesting electronic
  services will not be interpreted as removing any
  applicable parental consent, age-verification or
  child-protection requirements.
</p>

          <p className="mt-2">
            We will take appropriate steps where we become
            aware that an account does not meet the minimum
            age requirement or that personal information
            has been collected in violation of applicable
            requirements.
          </p>

          <p className="mt-2">
            Children should not publish sensitive personal
            information or communicate with people they
            do not know without appropriate care.
          </p>
        </Section>

        <Section title="19. Third-Party Websites and Services">
          <p>
            AfricSocial may contain links to third-party
            websites, applications or services. Those
            services operate under their own terms and
            privacy policies.
          </p>

          <p className="mt-2">
            We are not responsible for the privacy practices
            of independent third parties. We encourage users
            to review the privacy notices of services they
            access.
          </p>
        </Section>

        <Section title="20. Privacy During Development and Testing">
          <p>
            AfricSocial is currently under development and
            has not yet launched publicly. During development
            and testing, we may process limited information
            from developers, testers, invited participants
            or other people who interact with test versions
            of the platform.
          </p>

          <p className="mt-2">
  Access to personal information used during development
  and testing will be limited to authorised individuals
  who require it for legitimate development, testing,
  maintenance or security purposes. Where practical,
  test data will be anonymised or replaced with
  non-production sample information.
</p>

          <p className="mt-2">
            Test environments may contain incomplete features
            or temporary technical limitations. We will
            take reasonable steps to protect information
            processed during testing and avoid using real
            personal or financial information unnecessarily.
          </p>

          <p className="mt-2">
            Planned features described in this policy may
            change before launch. We will update this policy
            to reflect material changes to actual data
            processing practices.
          </p>
        </Section>

        <Section title="21. Changes to This Privacy Policy">
          <p>
            We may update this Privacy Policy as AfricSocial
            develops, launches new features or changes its
            data-processing practices.
          </p>

          <p className="mt-2">
            The date at the top of this page indicates
            when the current version was last updated.
            Where changes are material, we will provide
            notice through appropriate platform channels
            or other means required by law.
          </p>

          <p className="mt-2">
            We encourage users to review this policy
            periodically.
          </p>
        </Section>

        <Section title="22. Contact and Privacy Complaints">
          <p>
            For privacy questions, data-protection requests
            or complaints, contact:
          </p>

          <p className="mt-3">
  <strong>Organisation:</strong> AfricSocial Technologies
  Limited (proposed organisation; incorporation with
  the Corporate Affairs Commission of Nigeria is in progress)
</p>

          <p className="mt-2">
  We will review privacy enquiries and complaints and
  respond within the time limits required by applicable
  data-protection laws. Where necessary, we may request
  additional information to verify your identity or
  investigate the matter.
</p>

          <p>
            <strong>Privacy contact:</strong>
          </p>

          <p>
            <a
              href="mailto:privacy@africsocial.com"
              className="text-blue-600 underline"
            >
              privacy@africsocial.com
            </a>
          </p>

          <p className="mt-2">
            You may also have the right to lodge a complaint
            with the Nigeria Data Protection Commission
            or another competent data-protection authority,
            as applicable.
          </p>
        </Section>

      </div>

      <nav className="mt-10 border-t pt-5 flex flex-wrap gap-5 text-blue-600">
        <Link to="/delete-account" className="underline">
          Account deletion
        </Link>

        <Link to="/login" className="underline">
          Sign in
        </Link>
      </nav>
    </main>
  );
}