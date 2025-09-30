'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Trophy } from '@phosphor-icons/react/dist/ssr/Trophy';

import { UserDAO } from '@/daos/userDAO'; // importa o DAO

export interface TotalProfitProps {
  sx?: SxProps;
}

export function TotalProfit({ sx }: TotalProfitProps): React.JSX.Element {
  const [totalPoints, setTotalPoints] = useState<number>(0);

  useEffect(() => {
    const dao = new UserDAO();

    // registra o listener em tempo real
    const unsubscribe = dao.listenTotalPoints((total) => {
      setTotalPoints(total);
    });

    // remove o listener quando desmontar o componente
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack
          direction="row"
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
          spacing={3}
        >
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Pontos resgatados
            </Typography>
            <Typography variant="h4">{totalPoints}</Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: 'var(--mui-palette-warning-main)',
              height: '56px',
              width: '56px',
            }}
          >
            <Trophy fontSize="var(--icon-fontSize-lg)" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}