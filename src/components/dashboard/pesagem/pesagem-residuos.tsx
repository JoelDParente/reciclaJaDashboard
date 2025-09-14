'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, Grid, TextField, MenuItem, Button, Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { WasteRecord } from '@/models/wasteRecord';
import { WasteRecordDAO } from '@/daos/wasteRecordDAO';
import { Chart } from '@/components/core/chart';

export function PesagemResiduos(): React.JSX.Element {
  const dao = React.useMemo(() => new WasteRecordDAO(), []);

  const [bairro, setBairro] = React.useState('');
  const [quantidades, setQuantidades] = React.useState<WasteRecord['quantidade']>({
    plastico: 0,
    papel: 0,
    vidro: 0,
    metal: 0,
    organico: 0,
    outros: 0,
  });

  const [registros, setRegistros] = React.useState<WasteRecord[]>([]);
  const [metrics, setMetrics] = React.useState({
    totalKg: 0,
    totalPorTipo: {
      plastico: 0,
      papel: 0,
      vidro: 0,
      metal: 0,
      organico: 0,
      outros: 0,
    },
    mediaKg: 0,
  });

  const coresResiduos = {
    plastico: '#2FB166',
    papel: '#FFD700',
    vidro: '#1E90FF',
    metal: '#FF4500',
    organico: '#32CD32',
    outros: '#808080',
  };

  const qtdPadrao = { plastico: 0, papel: 0, vidro: 0, metal: 0, organico: 0, outros: 0 };

  // Carregar registros e calcular métricas
  const loadRegistros = async () => {
    const data = await dao.findAll();
    const sorted = data.sort((a, b) => new Date(b.dataRegistro).getTime() - new Date(a.dataRegistro).getTime());
    setRegistros(sorted);

    const totais = { ...qtdPadrao };
    let totalKg = 0;

    sorted.forEach(r => {
      const qtd = r.quantidade ?? qtdPadrao;
      Object.keys(qtd).forEach(tipo => {
        totais[tipo as keyof typeof totais] += qtd[tipo as keyof typeof qtd];
      });
      totalKg += r.totalKg ?? 0;
    });

    const mediaKg = sorted.length ? totalKg / sorted.length : 0;
    setMetrics({ totalKg, totalPorTipo: totais, mediaKg });
  };

  React.useEffect(() => {
    loadRegistros();
  }, []);

  const totalKgForm = Object.values(quantidades).reduce((acc, v) => acc + v, 0);

  const handleChangeQuantidade = (tipo: keyof typeof quantidades, value: number) => {
    setQuantidades(prev => ({ ...prev, [tipo]: value }));
  };

  const handleSubmit = async () => {
    if (!bairro) {
      alert('Selecione um bairro');
      return;
    }

    const novoRegistro: Omit<WasteRecord, 'id'> = {
      bairro,
      cidade: 'Morada Nova',
      dataRegistro: new Date(),
      quantidade: quantidades,
      totalKg: totalKgForm,
    };

    await dao.create(novoRegistro);
    alert('Pesagem registrada com sucesso ✅');

    setQuantidades({ plastico: 0, papel: 0, vidro: 0, metal: 0, organico: 0, outros: 0 });
    setBairro('');

    loadRegistros();
  };

  // Dados gráficos
  const pieData = Object.entries(metrics.totalPorTipo).map(([key, value]) => ({ name: key, value }));
  const barData = registros.slice(0, 7).map(r => {
    const qtd = r.quantidade ?? qtdPadrao;
    return {
      bairro: r.bairro,
      plastico: qtd.plastico,
      papel: qtd.papel,
      vidro: qtd.vidro,
      metal: qtd.metal,
      organico: qtd.organico,
      outros: qtd.outros,
    };
  });

  const barSeries = Object.keys(qtdPadrao).map(t => ({
    name: t[0].toUpperCase() + t.slice(1),
    data: registros.length
      ? registros.slice(0, 7).map(r => (r.quantidade ?? qtdPadrao)[t as keyof typeof qtdPadrao])
      : [0], // fallback seguro
  }));

  const barCategories = registros.length
    ? registros.slice(0, 7).map(r => r.bairro)
    : ['Nenhum registro'];

  const pieSeries = Object.values(metrics.totalPorTipo).length
    ? Object.values(metrics.totalPorTipo)
    : [0];

  const pieLabels = Object.keys(metrics.totalPorTipo).length
    ? Object.keys(metrics.totalPorTipo).map(t => t[0].toUpperCase() + t.slice(1))
    : ['Nenhum'];


  return (
    <Grid container spacing={2}>
      {/* Formulário de Pesagem */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardHeader title="Registrar Pesagem" />
          <CardContent>
            <TextField
              label="Bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              select
              fullWidth
              margin="normal"
            >
              <MenuItem value="Centro">Centro</MenuItem>
              <MenuItem value="Jardim">Jardim</MenuItem>
              <MenuItem value="Vila Nova">Vila Nova</MenuItem>
            </TextField>

            {Object.keys(quantidades).map((tipo) => (
              <TextField
                key={tipo}
                label={`${tipo[0].toUpperCase() + tipo.slice(1)} (kg)`}
                type="number"
                value={quantidades[tipo as keyof typeof quantidades]}
                onChange={(e) => handleChangeQuantidade(tipo as keyof typeof quantidades, Number(e.target.value))}
                fullWidth
                margin="normal"
              />
            ))}

            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Total: {totalKgForm.toFixed(2)} kg
            </Typography>

            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSubmit} color="success">
              Registrar
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Métricas e gráficos */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Grid container spacing={2}>
          {/* Cards de Métricas */}
          <Grid size={{ xs: 12 }} container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography>Total Registrado</Typography>
                  <Typography variant="h5">{metrics.totalKg.toFixed(2)} kg</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography>Média por Registro</Typography>
                  <Typography variant="h5">{metrics.mediaKg.toFixed(2)} kg</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography>Registros</Typography>
                  <Typography variant="h5">{registros.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Gráfico de Pizza */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader title="Distribuição por Tipo" />
              <CardContent>
                {pieSeries[0] > 0 ? (
                  <Chart
                    options={{
                      labels: pieLabels,
                      colors: Object.keys(coresResiduos).map(t => coresResiduos[t as keyof typeof coresResiduos]),
                      legend: { position: 'bottom' },
                      tooltip: { y: { formatter: (val: number) => `${val.toFixed(2)} kg` } },
                    }}
                    series={pieSeries}
                    type="donut"
                    height={250}
                  />
                ) : (
                  <Typography>Nenhum registro para exibir gráfico de pizza</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico de Barras */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader title="Últimos Registros (kg por tipo)" />
              <CardContent>
                {registros.length > 0 ? (
                  <Chart
                    options={{
                      chart: { stacked: true },
                      xaxis: { categories: barCategories },
                      colors: Object.keys(coresResiduos).map(t => coresResiduos[t as keyof typeof coresResiduos]),
                      legend: { position: 'bottom' },
                      tooltip: { y: { formatter: (val: number) => `${val.toFixed(2)} kg` } },
                    }}
                    series={barSeries}
                    type="bar"
                    height={250}
                  />
                ) : (
                  <Typography>Nenhum registro para exibir gráfico de barras</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Tabela de Registros */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="Últimos Registros" />
              <CardContent>
                {registros.length === 0 ? (
                  <Typography>Nenhum registro encontrado.</Typography>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Bairro</TableCell>
                        <TableCell>Plástico</TableCell>
                        <TableCell>Papel</TableCell>
                        <TableCell>Vidro</TableCell>
                        <TableCell>Metal</TableCell>
                        <TableCell>Orgânico</TableCell>
                        <TableCell>Outros</TableCell>
                        <TableCell>Total (kg)</TableCell>
                        <TableCell>Data</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {registros.slice(0, 10).map((r) => {
                        const qtd = r.quantidade ?? qtdPadrao;
                        return (
                          <TableRow key={r.id}>
                            <TableCell>{r.bairro}</TableCell>
                            <TableCell>{qtd.plastico}</TableCell>
                            <TableCell>{qtd.papel}</TableCell>
                            <TableCell>{qtd.vidro}</TableCell>
                            <TableCell>{qtd.metal}</TableCell>
                            <TableCell>{qtd.organico}</TableCell>
                            <TableCell>{qtd.outros}</TableCell>
                            <TableCell>{(r.totalKg ?? 0).toFixed(2)}</TableCell>
                            <TableCell>{new Date(r.dataRegistro).toLocaleDateString()}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}