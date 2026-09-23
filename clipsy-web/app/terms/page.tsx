import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Terms of use | Clipsy', description: 'Terms for using Clipsy campaigns, guides, and dashboard.' };

export default function TermsPage() {
  return <LegalPage eyebrow="Legal" title="Terms of use" updated="September 22, 2026">
    <h2>Using Clipsy</h2>
    <p>You must provide accurate information, control the accounts you connect, follow each campaign brief, and comply with platform rules and applicable law. Do not submit stolen work, fabricated metrics, duplicate claims, malicious links, or content you do not have permission to use.</p>
    <h2>Campaigns and earnings</h2>
    <p>Rates, eligibility windows, minimum views, budgets, permitted platforms, and content rules vary by campaign. A submission is not payable until it passes review and any stated hold or verification requirements. Estimates and calculators are informational, not payment guarantees.</p>
    <h2>Payouts</h2>
    <p>You are responsible for supplying a correct payout destination and any required tax information. Provider fees, failed transfers, compliance holds, reversals, and laws may affect timing or availability. Crypto transfers sent to an incorrect address or network may be unrecoverable.</p>
    <h2>Moderation and suspension</h2>
    <p>Clipsy may reject submissions, pause access, investigate suspicious activity, or suspend accounts to protect campaigns and participants. We may correct obvious errors and preserve records needed to resolve disputes.</p>
    <h2>Availability and changes</h2>
    <p>The service is provided as available. Campaigns and third-party integrations can change or stop without notice. We may update these terms as the product evolves; continued use after an update means you accept the revised terms.</p>
    <h2>Contact</h2>
    <p>Questions about these terms can be sent through the <a href="/contact">Clipsy contact page</a>.</p>
  </LegalPage>;
}
