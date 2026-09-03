import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GS-26 Privacy Policy",
  description:
    "How the Policy Innovation Centre handles delegate data in the GS-26 summit app.",
};

/**
 * The privacy policy for the GS-26 delegate app, served from the admin app so
 * App Store Connect and Play Console have a stable public URL. Deliberately
 * written from what the system actually does - every claim below corresponds
 * to real behaviour in the codebase, and it should be updated when that
 * behaviour changes, not left to drift.
 */

const SECTIONS: { heading: string; body: (string | string[])[] }[] = [
  {
    heading: "Who we are",
    body: [
      "The GS-26 delegate app is operated by the Policy Innovation Centre (PIC), organiser of the GS-26 Gender & Inclusion Summit 2026 (Abuja, 8-9 September 2026). PIC is the data controller for the personal data described here.",
      "This policy covers the GS-26 mobile app and the summit services behind it. It is written to comply with the Nigeria Data Protection Act 2023 (NDPA).",
    ],
  },
  {
    heading: "What we collect",
    body: [
      "Account and registration: your name, email address, password (stored only as a one-way cryptographic hash, so we cannot read it), an optional phone number if you verify by SMS, and the time you gave consent. Your access tier (standard, VIP, press and so on) comes from the summit's registration list, not from anything you enter.",
      "Profile: organisation, role, country, the tracks and interests you select, and an optional profile photo.",
      "Things you create in the app: direct messages to other delegates (including reactions and replies), comments in session discussions, trivia answers, Innovation Hub votes, networking connections (for example when another delegate scans your QR pass), session attendance, and your certificate of participation once earned.",
      "Technical data: a push notification token for your device if you enable notifications, and the IP address and device identifier captured when you sign in, kept for account security (for example to revoke stolen sessions).",
      "Device permissions: the app asks for camera access only when you scan another delegate's QR pass to connect. The camera image is read on your device to decode the QR code and is never uploaded, stored or seen by us. It asks for photo library access only when you choose a profile photo, and reads nothing else from your library. You can refuse either permission and still use the rest of the app.",
    ],
  },
  {
    heading: "Live captions and AI",
    body: [
      "Speech at summit sessions is captured from venue microphones, transcribed by an automated speech-to-text service (Deepgram) and translated into Hausa, Igbo, Yoruba and Nigerian Pidgin by an AI model (Anthropic Claude). Captions and transcripts are stored so delegates who join late can catch up and so an accurate record of sessions exists.",
      "All AI-generated captions and translations are labelled as such in the app. Reading captions does not send any of your personal data to these providers. Only session speech is processed.",
    ],
  },
  {
    heading: "How we use your data",
    body: [
      "To run the summit: your programme, bookmarks, notifications, networking, voting, trivia, discussions and certificate.",
      "To verify your identity at registration (one-time codes by email or SMS) and keep your account secure.",
      "To moderate the community: comments can be reported by delegates and hidden by organisers, and you can block other delegates, which prevents contact in both directions.",
      "Our lawful bases under the NDPA are: the consent you give at registration (for your account, profile and communications), the performance of our agreement with you as a registered delegate (for summit features like voting, networking and certificates), and our legitimate interest in keeping the platform secure (for sign-in records and moderation).",
      "We do not sell your data, use it for advertising, or run analytics or tracking SDKs. The app does not track you across other companies' apps or websites.",
    ],
  },
  {
    heading: "Who processes data for us",
    body: [
      "We use a small number of service providers, each only for the purpose stated:",
      [
        "Amazon Web Services (hosting and file storage, London region): all summit data and profile photos. Photos live in private storage and are served through short-lived signed links, never public URLs.",
        "Zoho ZeptoMail (email) and Termii (SMS): delivery of one-time verification codes.",
        "Google Firebase: delivery of push notifications to your device.",
        "Deepgram (speech-to-text) and Anthropic (translation): session audio and caption text only, as described above.",
        "LiveKit: live session audio streaming, when you choose to listen to a session's audio feed.",
      ],
      "Each of these providers processes data only on our instructions, and each is bound by contract terms that require the same or equal protection of your data as this policy and the NDPA provide. None of them may use your data for their own purposes.",
      "Because our servers are in the AWS London region, your data is stored outside Nigeria. This transfer is protected as the NDPA requires: each provider's data processing agreement imposes contractual safeguards giving your data a level of protection adequate to the Act, and you can object to the transfer by choosing not to register or by deleting your account.",
    ],
  },
  {
    heading: "How long we keep it, and deletion",
    body: [
      "Account, profile, messages, connections, votes, attendance and certificates: kept while your account exists. You can delete your account at any time in the app (Settings → Delete account, confirmed with your password), which removes all of them immediately.",
      "One-time verification codes: expire after 10 minutes and are not reused.",
      "Push notification tokens: kept until you disable notifications or delete your account.",
      "Session captions, transcripts and discussion threads: kept as the record of the summit's sessions. Your name on a discussion comment is removed when you delete your account.",
      "Security records (such as sign-in logs and revoked sessions): kept only as long as needed to protect accounts, then removed.",
      "Data in transit is always encrypted (TLS), passwords are stored only as one-way hashes, and profile photos live in private storage reachable only through short-lived signed links.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "Under the NDPA you can ask for access to the personal data we hold about you, ask us to correct it, ask us to delete it (the in-app deletion does this immediately), and withdraw consent. You also have the right to complain to the Nigeria Data Protection Commission.",
      "Inside the app you can additionally turn push notifications off at any time, report content, and block other delegates.",
    ],
  },
  {
    heading: "Children",
    body: [
      "The app is for registered summit delegates and is not directed at children.",
    ],
  },
  {
    heading: "Changes and contact",
    body: [
      "If this policy changes we will update this page and note the new effective date. Questions and data requests can be made through the Policy Innovation Centre's published contact channels at policyinnovationcentre.org.",
    ],
  },
];

/**
 * Many entries follow a "Label: detail" shape. Bolding the label makes the
 * policy scannable without changing the SECTIONS data model.
 */
function LeadIn({ text }: { text: string }) {
  const m = /^([^:]{3,80}): ([\s\S]*)$/.exec(text);
  if (!m) return <>{text}</>;
  return (
    <>
      <strong className="font-semibold text-summit-lilac">{m[1]}:</strong> {m[2]}
    </>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-[11px] tracking-[0.1em] text-summit-smoke uppercase">
        GS-26 Gender &amp; Inclusion Summit 2026
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-archivo)] text-4xl font-bold tracking-[-0.025em]">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-summit-smoke">
        Effective 27 August 2026 · Policy Innovation Centre
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {SECTIONS.map((s, n) => (
          <section key={s.heading}>
            <h2 className="font-[family-name:var(--font-archivo)] text-xl font-bold tracking-[-0.02em]">
              {n + 1}. {s.heading}
            </h2>
            <div className="mt-3 flex flex-col gap-3 text-sm leading-6 text-summit-lilac/90">
              {s.body.map((para, i) =>
                Array.isArray(para) ? (
                  <ul key={i} className="flex list-disc flex-col gap-2 pl-5">
                    {para.map((item) => (
                      <li key={item.slice(0, 40)}>
                        <LeadIn text={item} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p key={i}>
                    <LeadIn text={para} />
                  </p>
                ),
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
