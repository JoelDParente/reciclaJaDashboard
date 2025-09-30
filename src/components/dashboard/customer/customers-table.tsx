'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';

import { useSelection } from '@/hooks/use-selection';
import { collection, getDocs, doc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

interface ReportRow {
  id: string;
  userName: string;
  userEmail: string;
  bairro?: string;
  localOcorrencia: string;
  createdAt: Date;
}

export function ReportsTable(): React.JSX.Element {
  const [rows, setRows] = React.useState<ReportRow[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

React.useEffect(() => {
  // Referência da coleção
  const reportsRef = collection(db, 'irregular_reports');

  // Listener em tempo real
  const unsubscribe = onSnapshot(reportsRef, async (snapshot) => {
    const reports: ReportRow[] = [];

    for (const reportDoc of snapshot.docs) {
      const data = reportDoc.data();
      const userId = data.userId;
      let userName = 'Desconhecido';
      let userEmail = '---';
      let bairro = '---';

      if (userId) {
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (userSnap.exists()) {
          const userData: any = userSnap.data();
          userName = userData.nome;
          userEmail = userData.email;
          bairro = userData.endereco?.bairro ?? '---';
        }
      }

      reports.push({
        id: reportDoc.id,
        userName,
        userEmail,
        bairro,
        localOcorrencia: data.reportText,
        createdAt: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
      });
    }

    setRows(reports);
  });

  // Cleanup do listener
  return () => unsubscribe();
}, []);


  const rowIds = React.useMemo(() => {
    return rows.map((row) => row.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } =
    useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  // Função para deletar selecionados
  const handleDeleteSelected = async () => {
    if (!selected || selected.size === 0) return;

    // Remover do Firestore
    for (const id of selected) {
      await deleteDoc(doc(db, 'irregular_reports', id));
    }

    // Atualizar localmente (remover linhas deletadas)
    setRows((prev) => prev.filter((r) => !selected.has(r.id)));
    deselectAll();
  };

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        {selected && selected.size > 0 && (
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSelected}
          >
            Excluir selecionados ({selected.size})
          </Button>
        )}
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Bairro do Usuário</TableCell>
              <TableCell>Local da Ocorrência</TableCell>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                const isSelected = selected?.has(row.id);

                return (
                  <TableRow hover key={row.id} selected={isSelected} >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          if (event.target.checked) {
                            selectOne(row.id);
                          } else {
                            deselectOne(row.id);
                          }
                        }}
                        color="success"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        <Avatar />
                        <Typography variant="subtitle2">{row.userName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.userEmail}</TableCell>
                    <TableCell>{row.bairro}</TableCell>
                    <TableCell>{row.localOcorrencia}</TableCell>
                    <TableCell>{dayjs(row.createdAt).format('DD/MM/YYYY HH:mm')}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        color="success"
        count={rows.length}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Linhas por página"
      />
    </Card>
  );
}