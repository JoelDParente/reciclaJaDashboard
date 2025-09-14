import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { PesagemResiduos } from '@/components/dashboard/pesagem/pesagem-residuos';

export const metadata = {
  title: `Pesagem de Resíduos | ${config.site.name}`,
} satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={1} sx={{ p: 0 }}>
      <div>
        <Typography variant="h4">Pesagem de Resíduos</Typography>
      </div>
      <PesagemResiduos />
    </Stack>
  );
}
