// src/components/dashboard/pesagem/pesagem-residuos-wrapper.tsx
'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { PesagemResiduos } from './pesagem-residuos';

export interface PesagemResiduosProps {
  userId: string;
  openModal: boolean;
  onCloseModal: () => void;
}

export function PesagemResiduosWrapper({
  renderConfigButton,
}: { renderConfigButton?: (open: () => void) => React.ReactNode }) {
  const [uid, setUid] = React.useState<string | null>(null);
  const [openConfigModal, setOpenConfigModal] = React.useState(false);

  const handleOpen = () => setOpenConfigModal(true);
  const handleClose = () => setOpenConfigModal(false);

  React.useEffect(() => {
    const auth = getAuth(); 
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
    return () => unsubscribe();
  }, []);

  if (!uid) return <Typography>Carregando usuário...</Typography>;

  return (
    <>
      {/* Botão passado da página */}
      {renderConfigButton && renderConfigButton(handleOpen)}

      {/* Componente de pesagem */}
      <PesagemResiduos userId={uid} openModal={openConfigModal} onCloseModal={handleClose} />
    </>
  );
}

