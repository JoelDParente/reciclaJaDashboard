'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';

import { WasteRecord } from '@/models/wasteRecord';
import { PointsConfig } from '@/models/points';
import { PointsConfigDAO } from '@/daos/pointsDAO';
import { PointsService } from '@/services/pointsService';
import { WasteRecordService } from '@/services/wasteRecordService';
import { Chart } from '@/components/core/chart';

const coresResiduos = {
  plastico: '#2FB166',
  papel: '#FFD700',
  vidro: '#1E90FF',
  metal: '#FF4500',
  organico: '#32CD32',
  outros: '#808080',
};



export function PesagemResiduos({ userId }: { userId: string }) {
  const wasteService = React.useMemo(() => new WasteRecordService(), []);
  const pointsDAO = React.useMemo(() => new PointsConfigDAO(), []);

  const qtdPadrao = { plastico: 0, papel: 0, vidro: 0, metal: 0, organico: 0, outros: 0 };

  const [bairro, setBairro] = React.useState('');
  const [quantidades, setQuantidades] = React.useState<WasteRecord['quantidade']>(qtdPadrao);
  const [registros, setRegistros] = React.useState<WasteRecord[]>([]);
  const [config, setConfig] = React.useState<PointsConfig | null>(null);
  const [previewPoints, setPreviewPoints] = React.useState<number>(0);
  const [metrics, setMetrics] = React.useState({
    totalKg: 0,
    totalPorTipo: { ...qtdPadrao },
    mediaKg: 0,
  });

  const totalKgForm = Object.values(quantidades).reduce((acc, v) => acc + v, 0);

  /** Carregar configuração */
  React.useEffect(() => {
    pointsDAO.getCurrentConfig().then((cfg) => {
      if (cfg) setConfig(cfg);
    });
  }, []);

  /** Carregar registros e métricas */
  const loadRegistros = React.useCallback(async () => {
    const data = await wasteService.getAllRecords(); // ✅ agora público
    const totais = await wasteService.getTotais(data); // ✅ agora público
    const totalKg = data.reduce((acc, r) => acc + r.totalKg, 0);
    const mediaKg = data.length ? totalKg / data.length : 0;

    setMetrics({
      totalKg,
      totalPorTipo: totais,
      mediaKg,
    });
    setRegistros(data);
  }, []);

  React.useEffect(() => {
    loadRegistros();
  }, [loadRegistros]);

  /** Atualizar preview de pontos */
  React.useEffect(() => {
    if (config) {
      const result = PointsService.calculatePoints(config, quantidades, totalKgForm);
      setPreviewPoints(result.totalPoints);
    }
  }, [config, quantidades, totalKgForm]);

  const handleChangeQuantidade = (tipo: keyof typeof quantidades, value: number) => {
    setQuantidades((prev) => ({ ...prev, [tipo]: value }));
  };

  const handleSubmit = async () => {
    if (!bairro || !config) return alert('Selecione um bairro e verifique a configuração de pontos.');

    const pontos = PointsService.calculatePoints(config, quantidades, totalKgForm).totalPoints;
    const novoRegistro: Omit<WasteRecord, 'id'> = {
      userId,
      bairro,
      cidade: 'Morada Nova',
      dataRegistro: new Date(),
      quantidade: quantidades,
      totalKg: totalKgForm,
      pontos,
    };

    await wasteService.registrar(novoRegistro);
    alert(`Pesagem registrada com sucesso ✅ +${pontos} pontos`);

    setQuantidades(qtdPadrao);
    setBairro('');
    loadRegistros();
  };

  /** Dados para gráficos */
  const pieSeries = Object.values(metrics.totalPorTipo);
  const pieLabels = Object.keys(metrics.totalPorTipo).map((t) => t[0].toUpperCase() + t.slice(1));

  const barCategories = registros.slice(0, 7).map((r) => r.bairro) || ['Nenhum registro'];
  const barSeries = Object.keys(qtdPadrao).map((t) => ({
    name: t[0].toUpperCase() + t.slice(1),
    data: registros.slice(0, 7).map((r) => r.quantidade[t as keyof typeof qtdPadrao]),
  }));

  return (
    <Grid container spacing={3}>
      {/* Configuração de Pontuação */}
      <Grid size={{ xs: 12, md: 12 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title="Configuração de Pontuação" />
          <CardContent>
            {config && (
              <TextField
                select
                label="Modelo de Cálculo"
                value={config.mode}
                onChange={(e) =>
                  setConfig({ ...config, mode: Number(e.target.value) as 1 | 2 | 3 })
                }
                fullWidth
              >
                <MenuItem value={1}>1 - Fixa por Solicitação</MenuItem>
                <MenuItem value={2}>2 - Fixa + Peso Total</MenuItem>
                <MenuItem value={3}>3 - Fixa + Peso por Tipo</MenuItem>
              </TextField>
            )}
          </CardContent>
        </Card>
      </Grid>
      {/* Formulário de Pesagem */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
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
              {['Centro', 'Jardim', 'Vila Nova'].map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </TextField>

            {Object.keys(quantidades).map((tipo) => (
              <TextField
                key={tipo}
                label={`${tipo[0].toUpperCase() + tipo.slice(1)} (kg)`}
                type="number"
                value={quantidades[tipo as keyof typeof quantidades]}
                onChange={(e) =>
                  handleChangeQuantidade(tipo as keyof typeof quantidades, Number(e.target.value))
                }
                fullWidth
                margin="normal"
              />
            ))}

            <Typography sx={{ mt: 2 }}>Total: {totalKgForm.toFixed(2)} kg</Typography>
            <Typography sx={{ mt: 1 }}>
              Pontos previstos: <strong>{previewPoints}</strong>
            </Typography>

            <Button
              fullWidth
              variant="contained"
              color="success"
              sx={{ mt: 3 }}
              onClick={handleSubmit}
            >
              Registrar
            </Button>
          </CardContent>
        </Card>
      </Grid>

     {/* Métricas e Gráficos */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Grid container spacing={2}>
          {/* Métricas */}
          {[
            { title: 'Total Registrado', value: metrics.totalKg.toFixed(2) + ' kg' },
            { title: 'Média por Registro', value: metrics.mediaKg.toFixed(2) + ' kg' },
            { title: 'Registros', value: registros.length },
          ].map((card) => (
            <Grid size={{ xs: 12, md: 4 }} key={card.title}>
              <Card>
                <CardContent>
                  <Typography>{card.title}</Typography>
                  <Typography variant="h5">{card.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Gráfico Pizza */}
          <Grid size={{ xs: 12, md: 12 }}>
            <Card>
              <CardHeader title="Distribuição por Tipo" />
              <CardContent>
                {pieSeries.reduce((a, v) => a + v, 0) > 0 ? (
                  <Chart
                    type="donut"
                    height={250}
                    series={pieSeries}
                    options={{
                      labels: pieLabels,
                      colors: Object.keys(coresResiduos).map(
                        (t) => coresResiduos[t as keyof typeof coresResiduos]
                      ),
                      legend: { position: 'bottom' },
                      tooltip: { y: { formatter: (val: number) => `${val.toFixed(2)} kg` } },
                    }}
                  />
                ) : (
                  <Typography>Nenhum registro para exibir gráfico de pizza</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico Barras */}
          <Grid size={{ xs: 12, md: 12 }}>
            <Card>
              <CardHeader title="Últimos Registros (kg por tipo)" />
              <CardContent>
                {registros.length ? (
                  <Chart
                    type="bar"
                    height={250}
                    series={barSeries}
                    options={{
                      chart: { stacked: true },
                      xaxis: { categories: barCategories },
                      colors: Object.keys(coresResiduos).map(
                        (t) => coresResiduos[t as keyof typeof coresResiduos]
                      ),
                      legend: { position: 'bottom' },
                      tooltip: { y: { formatter: (val: number) => `${val.toFixed(2)} kg` } },
                    }}
                  />
                ) : (
                  <Typography>Nenhum registro para exibir gráfico de barras</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
                    {['Bairro', 'Plástico', 'Papel', 'Vidro', 'Metal', 'Orgânico', 'Outros', 'Total (kg)', 'Pontos', 'Data'].map(
                      (h) => (
                        <TableCell key={h}>{h}</TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registros.slice(0, 10).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.bairro}</TableCell>
                      {Object.keys(qtdPadrao).map((t) => (
                        <TableCell key={t}>{r.quantidade[t as keyof typeof qtdPadrao]}</TableCell>
                      ))}
                      <TableCell>{r.totalKg.toFixed(2)}</TableCell>
                      <TableCell>{r.pontos}</TableCell>
                      <TableCell>{r.dataRegistro.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>

  );
}