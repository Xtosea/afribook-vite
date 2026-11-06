import React from "react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Respect and Human Dignity",
    paragraphs: [
      "Treat other people with dignity and respect. AfricSocial does not permit content or conduct intended to degrade, threaten, intimidate or dehumanise others.",
      "You may disagree, criticise ideas and express opinions, but do so without targeted abuse, threats or attacks on a person's dignity."
    ]
  },
  {
    title: "2. Hate Speech and Discrimination",
    paragraphs: [
      "Do not attack, threaten or promote hatred against individuals or groups because of protected or personal characteristics such as race, ethnicity, nationality, religion, disability, sex or other characteristics protected by applicable law.",
      "Content that promotes discrimination, exclusion, dehumanisation or violence against people on these grounds may be removed."
    ]
  },
  {
    title: "3. Bullying, Harassment and Threats",
    paragraphs: [
      "Do not engage in repeated unwanted contact, targeted humiliation, stalking, intimidation, sexual harassment, blackmail or threats.",
      "Do not encourage others to harass, threaten or coordinate attacks against another person. Criticism and disagreement must not become targeted abuse."
    ]
  },
  {
    title: "4. Violence and Dangerous Content",
    paragraphs: [
      "Do not threaten, praise or encourage real-world violence, terrorism or physical harm.",
      "Content that promotes dangerous challenges, serious self-injury, or instructions intended to cause harm may be restricted. Documentary, educational or newsworthy material may be assessed in context."
    ]
  },
  {
    title: "5. Nudity and Sexual Content",
    paragraphs: [
      "Do not publish sexually explicit pornography, sexual exploitation material or non-consensual intimate imagery.",
      "Sexual solicitation, coercion and content involving the sexual exploitation of another person are prohibited. Any permitted non-explicit material remains subject to applicable law and platform rules."
    ]
  },
  {
    title: "6. Child Safety and Protection",
    paragraphs: [
      "AfricSocial is intended for people aged 13 and above, or any higher minimum age required by applicable law. Children below the applicable minimum age must not create or use accounts.",
      "Sexual exploitation, grooming, abuse, trafficking, or sexualised content involving minors is strictly prohibited. Never request, share or distribute child sexual abuse material.",
      "Suspected child exploitation may be escalated to appropriate authorities where required or permitted by law."
    ]
  },
  {
    title: "7. Fake Accounts and Impersonation",
    paragraphs: [
      "Do not impersonate another person, public figure, business or organisation in a misleading or deceptive way.",
      "Do not use fake identities to deceive people, evade enforcement, conduct fraud or manipulate platform activity. Parody and fan accounts should be clearly identified where confusion is possible."
    ]
  },
  {
    title: "8. Spam and Artificial Engagement",
    paragraphs: [
      "Do not flood the platform with repetitive, irrelevant or unsolicited content, comments or messages.",
      "Do not use bots, fake accounts, engagement farms, purchased interactions or other deceptive methods to artificially increase views, followers, reactions or rankings."
    ]
  },
  {
    title: "9. Scams, Fraud and Financial Abuse",
    paragraphs: [
      "Do not use AfricSocial to defraud, deceive, exploit or financially harm other people.",
      "Prohibited conduct includes phishing, fake investment schemes, fraudulent giveaways, deceptive fundraising, payment manipulation, impersonation for financial gain and attempts to steal account or payment information."
    ]
  },
  {
    title: "10. Privacy and Personal Information",
    paragraphs: [
      "Do not publish another person's private or sensitive information without an appropriate legal basis or their permission.",
      "This includes private addresses, telephone numbers, financial information, identity documents, private conversations and non-consensual intimate images.",
      "Do not use AfricSocial to stalk, expose, threaten or intimidate people using their personal information."
    ]
  },
  {
    title: "11. Copyright and Intellectual Property",
    paragraphs: [
      "Only upload or distribute content that you created, own, have permission to use, or are otherwise legally entitled to share.",
      "Do not unlawfully copy, distribute or exploit another person's photographs, videos, music, writing, trademarks or other protected material.",
      "AfricSocial may restrict reported material and take appropriate action in response to valid intellectual-property complaints and applicable legal requirements."
    ]
  },
  {
    title: "12. Misinformation and Deceptive Content",
    paragraphs: [
      "Do not use fabricated identities, manipulated media or deceptive claims to commit fraud, impersonate others, incite violence or cause serious harm.",
      "Satire, opinion, debate and good-faith mistakes are not automatically violations. Content may be assessed according to its context, intent, reach and potential harm."
    ]
  },
  {
    title: "13. Illegal Goods and Activities",
    paragraphs: [
      "Do not use AfricSocial to buy, sell, promote or facilitate illegal goods, prohibited services, criminal activity, exploitation or trafficking.",
      "Content that facilitates unlawful activity or creates a serious risk to public safety may be removed or referred to appropriate authorities where legally required."
    ]
  },
  {
    title: "14. Marketplace Rules",
    paragraphs: [
      "Marketplace users must provide honest descriptions, accurate prices and truthful information about products and services.",
      "Do not list stolen, counterfeit, prohibited or illegal goods. Do not use listings to mislead buyers, evade payment obligations or facilitate fraud.",
      "Users should independently assess sellers and transactions. Marketplace features may be subject to additional terms and restrictions."
    ]
  },
  {
    title: "15. Advertising and Promotional Content",
    paragraphs: [
      "Advertisements and promotional posts must be lawful, truthful and not misleading.",
      "Do not use advertising tools to promote scams, prohibited products, discriminatory content, deceptive financial opportunities or other content that violates these Guidelines.",
      "Advertisers must comply with applicable advertising laws and any additional AfricSocial advertising requirements."
    ]
  },
  {
    title: "16. Creator Monetisation Rules",
    paragraphs: [
      "Creators seeking monetisation must provide accurate account and payment information and comply with applicable eligibility requirements.",
      "Do not manipulate views, engagement, referrals or other performance measurements to obtain payments or rewards.",
      "Fraudulent activity, copied content used without permission, misleading promotions or violations of these Guidelines may affect monetisation eligibility and payments, subject to applicable terms and law."
    ]
  },
  {
    title: "17. Messaging and Communication",
    paragraphs: [
      "Do not use private messages, comments, calls or other communication features for threats, harassment, scams, spam, exploitation or unlawful activity.",
      "Respect other people's boundaries. Do not send repeated unwanted messages or share private communications publicly in ways that violate their privacy or applicable law."
    ]
  },
  {
    title: "18. Account Security and Authenticity",
    paragraphs: [
      "Keep your login credentials secure and do not attempt to access another person's account without permission.",
      "Do not distribute malicious links, attempt to compromise accounts, bypass security controls or interfere with the platform.",
      "You are responsible for activity carried out through your account, subject to applicable law and the platform's terms."
    ]
  },
  {
    title: "19. Reporting and Review",
    paragraphs: [
      "If you encounter content or behaviour that may violate these Guidelines, use the reporting options provided by AfricSocial where available.",
      "Reports should be made honestly and in good faith. Do not submit knowingly false or abusive reports.",
      "AfricSocial may review reported material, consider relevant context and request additional information where appropriate. Reporting tools and review procedures may evolve as the platform develops."
    ]
  },
  {
    title: "20. Enforcement and Appeals",
    paragraphs: [
      "Depending on the nature, seriousness and frequency of a violation, AfricSocial may remove content, restrict access to features, limit distribution, suspend monetisation, temporarily suspend an account or permanently disable an account.",
      "Serious matters may be escalated where required by law. Enforcement decisions will take account of relevant context and applicable legal obligations.",
      "Where an appeal or review process is available, affected users may use the process communicated to them. An appeal does not guarantee that a decision will be reversed."
    ]
  }
];

export default function CommunityGuidelines() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <header className="mb-8">
        <p className="text-emerald-600 font-semibold">AfricSocial</p>
        <h1 className="text-3xl font-bold mt-2">Community Guidelines</h1>
        <p className="text-sm text-gray-500 mt-2">
          Last updated: 5 November 2026
        </p>
        <p className="text-sm text-gray-600 mt-3">
          Platform status: Under development. AfricSocial has not yet
          launched publicly. Some features and reporting or enforcement
          processes described here may not yet be operational.
        </p>
      </header>

      <div className="space-y-7 leading-7">
        <section>
          <h2 className="text-xl font-semibold mb-2">
            Our Community Commitment
          </h2>
          <p>
            AfricSocial is being developed to help people connect, communicate,
            share content, discover opportunities and participate in digital
            communities. These Community Guidelines explain the standards
            expected of people who use the platform.
          </p>
          <p className="mt-2">
            They apply to content and conduct across AfricSocial, including
            profiles, posts, photographs, videos, reels, stories, comments,
            groups, messages, calls, marketplace activity, advertisements and
            creator features, where those features are available.
          </p>
          <p className="mt-2">
            These Guidelines are intended to operate alongside our applicable
            Terms of Service, Privacy Policy and any additional feature-specific
            rules. They do not replace applicable laws.
          </p>
        </section>

        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p className={index > 0 ? "mt-2" : ""} key={index}>
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <section>
          <h2 className="text-xl font-semibold mb-2">
            Updates to These Guidelines
          </h2>
          <p>
            AfricSocial may update these Guidelines as the platform develops,
            new features become available, or legal and safety requirements
            change. Updated versions will be published on this page with a
            revised date where appropriate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            Our Commitment
          </h2>
          <p>
            We aim to build a community where people can express themselves,
            share ideas, discover opportunities and connect with others in a
            respectful and safer environment. Everyone using AfricSocial is
            expected to contribute to that goal.
          </p>
        </section>

        <div className="border-t pt-5 text-sm text-gray-600">
          <p>
            For information about how personal information is handled, read
            our{" "}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
