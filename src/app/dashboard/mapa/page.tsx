import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { MapaColetas } from '@/components/dashboard/mapa/pev-mapa';

export const metadata = {
  title: `Localização dos PEVs | ${config.site.name}`,
} satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={1} sx={{ p: 0 }}>
      <div>
        <Typography variant="h4">Mapa de Coletas</Typography>
      </div>
      <MapaColetas />
    </Stack>
  );
}