'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Stack,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
} from '@mui/material';
import dayjs from 'dayjs';
import { CardService } from '@/services/cardService';
import { Card as CardModel } from '@/models/cards';
import { useSelection } from '@/hooks/use-selection';

export function CardsTable(): React.JSX.Element {
  const [formData, setFormData] = React.useState({
    id: '',
    title: '',
    content: '',
    category: 'materiais',
  });
  const [rows, setRows] = React.useState<CardModel[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  React.useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    const cards = await CardService.listCards();
    // ordenar por data de criação decrescente
    const sorted = cards.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    setRows(sorted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.id) {
      // edição
      await CardService.updateCard(formData.id, {
        title: formData.title,
        content: formData.content,
        category: formData.category as CardModel['category'],
      });
    } else {
      // criação
      await CardService.createCard({
        title: formData.title,
        content: formData.content,
        category: formData.category as CardModel['category'],
      });
    }

    setFormData({ id: '', title: '', content: '', category: 'materiais' });
    await loadCards();
  };

  const handleEdit = (card: CardModel) => {
    setFormData({
      id: card.id ?? '',
      title: card.title,
      content: card.content,
      category: card.category,
    });
  };

  const handleDelete = async (id: string) => {
    await CardService.deleteCard(id);
    await loadCards();
  };

  const rowIds = React.useMemo(() => rows.map((r) => r.id!), [rows]);
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handleDeleteSelected = async () => {
    if (!selected || selected.size === 0) return;
    for (const id of selected) {
      await CardService.deleteCard(id);
    }
    await loadCards();
    deselectAll();
  };

  return (
    <Stack spacing={4}>
      {/* Formulário de criação/edição */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {formData.id ? 'Editar Card' : 'Novo Card'}
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField 
            color="success"
              label="Título (opcional)"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              fullWidth
            />
            <TextField 
            color="success"
              label="Texto"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              fullWidth
              required
              multiline
              minRows={3}
              inputProps={{ maxLength: 100 }}
            />
            <FormControl fullWidth>
              <InputLabel color="success">Categoria</InputLabel>
              <Select
              color="success"
                value={formData.category}
                label="Categoria"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <MenuItem value="materiais">Materiais</MenuItem>
                <MenuItem value="separar">Separar</MenuItem>
                <MenuItem value="reuso">Reuso</MenuItem>
                <MenuItem value="consumo">Consumo</MenuItem>
                <MenuItem value="impacto">Impacto</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" color="success">
                Salvar
              </Button>
              {formData.id && (
                <Button
                  variant="outlined"
                  onClick={() =>
                    setFormData({ id: '', title: '', content: '', category: 'materiais' })
                  }
                >
                  Cancelar
                </Button>
              )}
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Listagem */}
      <Card>
        <Box sx={{ p: 2 }}>
          {selected && selected.size > 0 && (
            <Button variant="contained" color="error" onClick={handleDeleteSelected}>
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
                    onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
                  />
                </TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Texto</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const isSelected = selected?.has(row.id!);
                  return (
                    <TableRow hover key={row.id} selected={isSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) =>
                            e.target.checked ? selectOne(row.id!) : deselectOne(row.id!)
                          }
                          color="success"
                        />
                      </TableCell>
                      <TableCell>{row.title || '—'}</TableCell>
                      <TableCell>{row.content}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>
                        {dayjs(row.createdAt).format('DD/MM/YYYY HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" onClick={() => handleEdit(row)} color="inherit">
                            Editar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDelete(row.id!)}
                          >
                            Excluir
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Linhas por página"
        />
      </Card>
    </Stack>
  );
}