'use client';

import * as React from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  Stack,
  MenuItem,
  Select,
} from '@mui/material';
import { BairroService } from '@/services/bairrosService';
import { BairroDoc } from '@/models/bairros';

export function AddBairrosForm(): React.JSX.Element {
  const [cidades, setCidades] = React.useState<BairroDoc[]>([]);
  const [cidadeSelecionada, setCidadeSelecionada] = React.useState<string>('');
  const [bairrosInput, setBairrosInput] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const bairroService = new BairroService();

  React.useEffect(() => {
    // Carregar lista de cidades na montagem
    const fetchData = async () => {
      const lista = await bairroService.listarCidades();
      setCidades(lista);
    };
    fetchData();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!cidadeSelecionada || !bairrosInput.trim()) return;

    const bairros = bairrosInput.split(',')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    setLoading(true);
    try {
      for (const bairro of bairros) {
        await bairroService.adicionarBairro(cidadeSelecionada, bairro);
      }
      alert(`Bairros adicionados à cidade ${cidadeSelecionada}: ${bairros.join(', ')}`);
      setBairrosInput('');
    } catch (error: any) {
      alert(error.message || 'Erro ao adicionar bairros');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader title="Adicionar Bairros" subheader="Insira vários bairros separados por vírgula" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <FormControl fullWidth>
              <InputLabel>Cidade</InputLabel>
              <Select
                value={cidadeSelecionada}
                onChange={(e) => setCidadeSelecionada(e.target.value)}
                label="Cidade"
              >
                {cidades.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.cidade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Bairros</InputLabel>
              <OutlinedInput
                label="Bairros"
                value={bairrosInput}
                onChange={(e) => setBairrosInput(e.target.value)}
                placeholder="Centro, Nova Morada, 02 de agosto"
              />
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Salvando...' : 'Adicionar'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}