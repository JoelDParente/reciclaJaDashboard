'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import type { SxProps } from '@mui/material/styles';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import dayjs from 'dayjs';

import { RankingService } from '@/services/rankingService';

export interface UserRanking {
  id: string;
  nome: string;
  pontos: number;
  posicao: number;
  updatedAt?: Date; // opcional
}

export interface RankingTableProps {
  sx?: SxProps;
}

export function RankingTable({ sx }: RankingTableProps): React.JSX.Element {
  const [users, setUsers] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchRanking() {
    setLoading(true);
    try {
      const ranking = await RankingService.getRankingGlobal();

      setUsers(
        ranking.map(u => ({
          id: u.id,
          nome: u.nome,
          pontos: u.pontos,
          posicao: u.posicao ?? 0, // <-- garante que seja number
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  fetchRanking();
}, []);


  if (loading) return <div>Carregando ranking...</div>;

  return (
    <Card sx={sx}>
      <CardHeader title="Ranking de Usuários" />
      <Divider />
      <List>
        {users.map((user, index) => (
          <ListItem divider={index < users.length - 1} key={user.id}>
            <ListItemText
              primary={`${user.posicao}. ${user.nome}`}
              primaryTypographyProps={{ variant: 'subtitle1' }}
              secondary={`Pontos: ${user.pontos}` + (user.updatedAt ? ` • Atualizado ${dayjs(user.updatedAt).format('DD/MM/YYYY')}` : '')}
              secondaryTypographyProps={{ variant: 'body2' }}
            />
            <IconButton edge="end">
              <DotsThreeVerticalIcon weight="bold" />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          Ver todos
        </Button>
      </CardActions>
    </Card>
  );
}