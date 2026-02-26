import { redirect } from 'next/navigation';

// Generic /landing → go to shop
export default function LandingIndexPage() {
  redirect('/shop');
}
