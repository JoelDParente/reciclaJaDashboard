'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { SxProps } from '@mui/system';
import { TablePagination } from '@mui/material';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';

import { SolicitacaoService } from '@/services/solicitacaoService';
import { UserService } from '@/services/userService';

interface RequestRow {
  id: string;
  userName: string;
  bairro?: string;
  createdAt: string;
}

export interface LatestRequests {
  sx?: SxProps;
}

export function LatestRequests(_sx: any): React.JSX.Element {
  const [requests, setRequests] = React.useState<RequestRow[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const paginatedRequests = requests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  React.useEffect(() => {
    const fetchRequests = async () => {
      const solicitacoes = await SolicitacaoService.getAllSolicitacoes();

      const rows: RequestRow[] = [];

      for (const s of solicitacoes) {
        let userName = "Desconhecido";
        let bairro = "---";

        if (s.userId) {
          const user = await UserService.getUser(s.userId);
          if (user) {
            userName = user.nome;
            bairro = user.endereco?.bairro ?? "---";
          }
        }

        rows.push({
          id: s.id!,
          userName,
          bairro,
          createdAt: s.date_string,
        });
      }

      setRequests(rows);

    };

    fetchRequests();
  }, []);

  return (


    <Card>
      <CardHeader title="Últimas Solicitações" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nome de Usuário</TableCell>
              <TableCell>Bairro</TableCell>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRequests.map((req) => (
              <TableRow hover key={req.id}>
                <TableCell>{req.userName}</TableCell>
                <TableCell>{req.bairro}</TableCell>
                <TableCell>{dayjs(req.createdAt).format('DD/MM/YYYY')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={requests.length} // total de solicitações
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0); // volta pra primeira página
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}
