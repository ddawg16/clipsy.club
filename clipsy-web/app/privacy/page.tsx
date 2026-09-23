import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Privacy policy | Clipsy', description: 'How Clipsy collects, uses, retains, and deletes data.' };

export default function PrivacyPage() {
  return <LegalPage eyebrow="Legal" title="Privacy policy" updated="September 22, 2026">
    <h2>What Clipsy collects</h2>
    <p>We collect the Discord identity used to sign in, roles needed to authorize actions, social accounts you link, campaign submissions, public post metrics, payment destinations, tax attestations, and security or fraud-review records. When you opt into platform analytics, we also process provider tokens and the analytics or audience data you authorize.</p>
    <h2>How we use it</h2>
    <p>We use this information to operate campaigns, verify ownership, track eligible views, calculate and send payouts, prevent abuse, answer support requests, and meet accounting or legal obligations. We do not sell personal information.</p>
    <h2>Sharing and processors</h2>
    <p>Data is shared only with service providers needed to run Clipsy, such as hosting, database, authentication, analytics, Discord, social platforms, and payout providers. Providers receive only the data needed for their role.</p>
    <h2>Security and retention</h2>
    <p>Access is role-scoped, API credentials are hashed or encrypted, provider tokens are encrypted, and sensitive actions require authenticated sessions or scoped keys. Operational data is retained while your account is active. When you delete your account, profile, login, provider, proof, and payment-identity data is removed or scrubbed. Pseudonymous submission, payment, fraud, and audit records may be retained for accounting, disputes, abuse prevention, and legal obligations.</p>
    <h2>Your choices</h2>
    <p>You can disconnect linked providers, disable payout methods, or permanently delete your account from the Clipsy dashboard. See the <a href="/data-deletion">data deletion guide</a> for details. For privacy questions, use the <a href="/contact">contact page</a>.</p>
  </LegalPage>;
}
