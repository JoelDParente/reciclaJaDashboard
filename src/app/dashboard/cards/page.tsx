import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { CardsTable } from '@/components/dashboard/cards/cards-table';

export const metadata = { title: `Cards | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Cards Educativos</Typography>
        </Stack>
      </Stack>

      {/* Espaço reservado para filtros (se precisar no futuro) */}
      {/* <CardsFilters /> */}

      {/* Aqui entra a tabela de cards */}
      <CardsTable />
    </Stack>
  );
}
