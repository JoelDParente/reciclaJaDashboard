import * as React from 'react';
import type { Metadata } from 'next';

import { GuestGuard } from '@/components/auth/guest-guard';
import { Layout } from '@/components/auth/layout';
import { SignUpForm } from '@/components/auth/sign-up-form';

export const metadata = { title: `Recicla Já | Cadastrar` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Layout>
      <GuestGuard>
        <SignUpForm />
      </GuestGuard>
    </Layout>
  );
}
