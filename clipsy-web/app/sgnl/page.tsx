import { redirect } from 'next/navigation';

// The SGNL brief lives in a Google Doc, linked from the campaign page like any
// other campaign. This route just bounces to the board so no brief content or
// dead link lives on the site.
export default function SgnlRedirect() {
  redirect('/');
}
