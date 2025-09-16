// src/components/dashboard/pesagem/pesagem-residuos-wrapper.tsx
'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { PesagemResiduos } from './pesagem-residuos';

export function PesagemResiduosWrapper() {
  const [uid, setUid] = React.useState<string | null>(null);

  React.useEffect(() => {
    const auth = getAuth(); 
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
    return () => unsubscribe();
  }, []);

  if (!uid) return <Typography>Carregando usuário...</Typography>;

  return <PesagemResiduos userId={uid} />;
}
