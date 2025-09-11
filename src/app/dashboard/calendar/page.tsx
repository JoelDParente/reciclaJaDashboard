import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { ColetasCalendar } from '@/components/dashboard/calendar/coleta-calendar';

export const metadata = {
  title: `Coletas | Dashboard | ${config.site.name}`,
} satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Programação de Coletas Seletivas</Typography>
      </div>
      <ColetasCalendar />
    </Stack>
  );
}
