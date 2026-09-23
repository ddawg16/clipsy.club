import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Delete your data | Clipsy', description: 'How to permanently delete a Clipsy account and connected data.' };

export default function DataDeletionPage() {
  return <LegalPage eyebrow="Privacy" title="Delete your Clipsy data" updated="September 22, 2026">
    <h2>Delete your account</h2>
    <ol>
      <li>Open the <a href="/dashboard">Clipsy dashboard</a> and sign in with Discord.</li>
      <li>Choose <strong>My Accounts</strong>.</li>
      <li>In “Delete your Clipsy account,” type <strong>DELETE</strong> and confirm.</li>
    </ol>
    <p>The request is immediate and cannot be undone. Your sessions are closed, access keys are revoked, provider connections and tokens are removed, linked social profiles and imported analytics are deleted, proof attachments are removed, and saved payment or tax identifiers are scrubbed.</p>
    <h2>What may remain</h2>
    <p>Clipsy may retain pseudonymous submission, payment, fraud, and audit records when needed for accounting, legal obligations, abuse prevention, or dispute resolution. These records remain attached only to a tombstoned internal identifier, not your Discord or social profile.</p>
    <h2>Provider-requested deletion</h2>
    <p>Supported platforms may send a signed deletion request directly to Clipsy. The request uses the same deletion process and returns a confirmation code and status URL to the provider.</p>
    <h2>Need help?</h2>
    <p>If you cannot access the dashboard, send a request through the <a href="/contact">contact page</a>. We may need to verify account ownership before acting.</p>
  </LegalPage>;
}
