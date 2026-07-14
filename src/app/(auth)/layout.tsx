import { getUserFromCookies } from '@/lib/helper';
import UserProvider from '../component/context/user-context';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userDoc = await getUserFromCookies();


  if (!userDoc) {
    redirect('/login');
  }

  const user = JSON.parse(JSON.stringify(userDoc));

  return (
    <UserProvider user={user}>
      {children}
    </UserProvider>
  );
}
