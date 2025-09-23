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
  TablePagination,
} from '@mui/material';
import type { SxProps } from '@mui/material/styles';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import { TrophyIcon } from '@phosphor-icons/react/dist/ssr/Trophy';
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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    async function fetchRanking() {
      setLoading(true);
      try {
        const ranking = await RankingService.getRankingGlobal();
        setUsers(ranking as UserRanking[]);
      } catch (error) {
        console.error("Falha ao buscar o ranking:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, []);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getTrophyColor = (pos: number) => {
    switch (pos) {
      case 1:
        return "gold";
      case 2:
        return "silver";
      case 3:
        return "#cd7f32"; // bronze
      default:
        return undefined;
    }
  };

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
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {user.posicao}
                      {user.posicao <= 3 && (
                        <TrophyIcon
                          weight="fill"
                          size={20}
                          color={getTrophyColor(user.posicao)}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {user.nome}
                  </TableCell>
                  <TableCell>{user.pontos}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />

      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Linhas por página"
      />

    </Card>
  );
}