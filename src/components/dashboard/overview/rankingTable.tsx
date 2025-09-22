'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Typography,
} from '@mui/material';
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
  updatedAt?: Date;
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
            posicao: u.posicao!,
            updatedAt: u.updatedAt,
          })) as UserRanking[]
        );
      } catch (error) {
        console.error("Falha ao buscar o ranking:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, []);

  if (loading) {
    return (
      <Card sx={{ ...sx, p: 2, textAlign: 'center' }}>
        <Typography>Carregando ranking...</Typography>
      </Card>
    );
  }

  return (
    <Card sx={sx}>
      <CardHeader title="Ranking de Usuários" />
      <Divider />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Posição</strong></TableCell>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Pontos</strong></TableCell>
              <TableCell><strong>Última atualização</strong></TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.posicao}</TableCell>
                <TableCell>{user.nome}</TableCell>
                <TableCell>{user.pontos}</TableCell>
                <TableCell>
                  {user.updatedAt ? dayjs(user.updatedAt).format('DD/MM/YYYY') : '—'}
                </TableCell>
                <TableCell align="right">
                  <IconButton>
                    <DotsThreeVerticalIcon weight="bold" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
