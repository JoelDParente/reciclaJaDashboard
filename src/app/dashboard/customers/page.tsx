import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';

import { config } from '@/config';
import { ReportsTable } from '@/components/dashboard/customer/customers-table';

export const metadata = { title: `Denúncias | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Denúncias</Typography>
        </Stack>
      </Stack>

      {/* Se precisar de filtros depois, pode adicionar aqui */}
      {/* <CustomersFilters /> */}

      {/* Aqui entra a tabela de denúncias */}
      <ReportsTable />
    </Stack>
  );
}