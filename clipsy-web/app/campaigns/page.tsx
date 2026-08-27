import { redirect } from 'next/navigation';

/**
 * The board moved to the root. This route stays so old links, the Discord
 * pins and anything already indexed keep working — /campaigns/<id> detail
 * pages are a separate route and are unaffected.
 */
export default function CampaignsRedirect(): never {
  redirect('/');
}
