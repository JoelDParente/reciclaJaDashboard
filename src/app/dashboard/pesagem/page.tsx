// src/app/dashboard/pesagem/page.tsx
'use client';

import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { PesagemResiduosWrapper } from '@/components/dashboard/pesagem/pesagem-residuos-wrapper';
import { Button } from '@mui/material';

// ---------------- Metadata da página ----------------
export const metadata: Metadata = {
  title: `Pesagem de Resíduos | ${config.site.name}`,
};

// ---------------- Page Server Component ----------------
export default function Page(): React.JSX.Element {
  return (
 <Stack spacing={2} sx={{ p: 2 }}>
  <Typography variant="h4">Pesagem de Resíduos</Typography>

  <PesagemResiduosWrapper
    renderConfigButton={(open) => (
      <Button variant="contained" color="success" onClick={open}>
        Configurar Pontos
      </Button>
    )}
  />
</Stack>

  );
}