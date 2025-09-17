'use client'

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Truck } from '@phosphor-icons/react/dist/ssr/Truck';

import { WasteRecordService } from '@/services/wasteRecordService';

export interface TasksProgressProps {
  sx?: SxProps;
  value: number;
}

export function TasksProgress({ value, sx }: TasksProgressProps): React.JSX.Element {
  const [totalKg, setTotalKg] = React.useState(0);

  React.useEffect(() => {
    const loadTotal = async () => {
      const service = new WasteRecordService();
      const records = await service.getAllRecords();
      const total = records.reduce((acc, r) => acc + r.totalKg, 0);
      setTotalKg(total);
    };

    loadTotal();
  }, []);
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Resíduos Coletados
              </Typography>
              <Typography variant="h4">{totalKg.toFixed(2)} kg</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-success-main)', height: '56px', width: '56px' }}>
              <Truck fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}