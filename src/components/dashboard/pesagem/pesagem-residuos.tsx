'use client';

import * as React from 'react';
import {
  Card, CardContent, CardHeader, Grid, TextField,
  MenuItem, Button, Typography, Stack, Autocomplete,
  Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

import dayjs from 'dayjs';

import { WasteRecord } from '@/models/wasteRecord';
import { PointsConfig } from '@/models/points';
import { PointsConfigDAO } from '@/daos/pointsConfigDAO';
import { PointsDAO } from '@/daos/pointsDAO';
import { PointsService } from '@/services/pointsService';
import { WasteRecordService } from '@/services/wasteRecordService';
import { UserService } from '@/services/userService';
import { SolicitacaoService } from '@/services/solicitacaoService';
import { BairroService } from '@/services/bairrosService';
import { SolicitacaoColeta } from '@/models/solicitacao';
import { PesagemResiduosProps } from './pesagem-residuos-wrapper';
import { PointsConfigModal } from './PointsConfigModal';
import { Quantidades } from '@/models/wasteRecord';
import { Chart } from '@/components/core/chart';

const coresResiduos = {
  plastico: '#2FB166',
  papel: '#FFD700',
  vidro: '#1E90FF',
  metal: '#FF4500',
  organico: '#32CD32',
  outros: '#808080',
};

export function PesagemResiduos({ userId }: PesagemResiduosProps) {
  const wasteService = React.useMemo(() => new WasteRecordService(), []);
  const pointsConfigDAO = React.useMemo(() => new PointsConfigDAO(), []);
  const pointsDAO = React.useMemo(() => new PointsDAO(), []);
  const bairroService = React.useMemo(() => new BairroService(), []);

  const qtdPadrao = { plastico: 0, papel: 0, vidro: 0, metal: 0, outros: 0 };
  const valores = { plastico: 15, papel: 10, vidro: 20, metal: 20 };

  const [quantidades, setQuantidades] = React.useState<WasteRecord['quantidade']>(qtdPadrao);
  const [registros, setRegistros] = React.useState<WasteRecord[]>([]);
  const [config, setConfig] = React.useState<PointsConfig | null>(null);
  const [previewPoints, setPreviewPoints] = React.useState<number>(0);

  const [solicitacoesPendentes, setSolicitacoesPendentes] = React.useState<SolicitacaoColeta[]>([]);
  const [selectedSolicitacao, setSelectedSolicitacao] = React.useState<string | null>(null);

  const [bairros, setBairros] = React.useState<string[]>([]);
  const [selectedBairro, setSelectedBairro] = React.useState<string>('');

  const [metrics, setMetrics] = React.useState({
    totalKg: 0,
    totalPorTipo: { ...qtdPadrao },
    mediaKg: 0,
  });

  const totalKgForm = Object.values(quantidades).reduce((acc, v) => acc + v, 0);

  const [openConfig, setOpenConfig] = React.useState(false);

  // Modal de sucesso
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  // Filtros da tabela
  const [filterUser, setFilterUser] = React.useState('');
  const [filterDate, setFilterDate] = React.useState<string | null>(null);

  // Carregar configuração de pontos
  React.useEffect(() => {
    pointsConfigDAO.getCurrentConfig().then(cfg => { if (cfg) setConfig(cfg); });
  }, [pointsConfigDAO]);

  // Carregar registros e métricas
  const loadRegistros = React.useCallback(async () => {
    const data = await wasteService.getAllRecords();
    const totais = await wasteService.getTotais(data);
    const totalKg = data.reduce((acc, r) => acc + r.totalKg, 0);
    const mediaKg = data.length ? totalKg / data.length : 0;
    setMetrics({ totalKg, totalPorTipo: totais, mediaKg });
    setRegistros(data);
  }, [wasteService]);

  React.useEffect(() => { loadRegistros(); }, [loadRegistros]);

  // Carregar solicitações pendentes
  // Listener em tempo real para solicitações pendentes
  React.useEffect(() => {
    const unsubscribe = SolicitacaoService.listenSolicitacoesPendentes(setSolicitacoesPendentes);
    return () => unsubscribe(); // cleanup quando desmontar
  }, []);


  React.useEffect(() => {
    // Atualiza os registros com userName ao iniciar o componente
    wasteService.atualizarUserNameEmRegistros();
  }, [wasteService]);

  // Carregar bairros
  React.useEffect(() => {
    bairroService.listarCidades().then(data => {
      const lista: string[] = data.flatMap(c => c.bairros);
      setBairros(lista);
    });
  }, [bairroService]);

  // Atualizar preview de pontos
  React.useEffect(() => {
    if (config) {
      const result = PointsService.calculatePoints(config, quantidades, totalKgForm);
      setPreviewPoints(result.totalPoints);
    }
  }, [config, quantidades, totalKgForm]);

  const handleChangeQuantidade = (tipo: keyof typeof quantidades, value: number) => {
    setQuantidades(prev => ({ ...prev, [tipo]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedSolicitacao || !selectedBairro || !config) {
      setSuccessMessage('Selecione solicitação, bairro e verifique a configuração.');
      setOpenSuccessModal(true);
      return;
    }

    const solicitacao = solicitacoesPendentes.find(s => s.id === selectedSolicitacao);
    if (!solicitacao) return;

    const pontos = PointsService.calculatePoints(config, quantidades, totalKgForm).totalPoints;

    const dataAtendimento = new Date();
    const dateString = solicitacao.date_string || dataAtendimento.toISOString().split('T')[0];
    const co2Evited = WasteRecordService.calcularCO2(quantidades);

    const novoRegistro: Omit<WasteRecord, 'id'> & { date_string: string } = {
      userId: solicitacao.userId,
      userName: solicitacao.userName,
      bairro: selectedBairro,
      cidade: 'Morada Nova',
      dataRegistro: dataAtendimento,
      date_string: dateString,
      quantidade: quantidades,
      co2Evited: co2Evited,
      totalKg: totalKgForm,
      pontos,
    };

    await wasteService.registrar(solicitacao.userId, novoRegistro);
    await pointsDAO.addUserPoints(solicitacao.userId, pontos, "pesagem");
    await SolicitacaoService.updateSolicitacao(solicitacao.id!, { isCompleted: true });

    setSuccessMessage(`Pesagem registrada ✅ +${pontos} pontos para ${solicitacao.userName}`);
    setOpenSuccessModal(true);

    setQuantidades(qtdPadrao);
    setSelectedSolicitacao(null);
    setSelectedBairro('');
    loadRegistros();
  };

  // Aplicar filtros à tabela
  const registrosFiltrados = registros
    .filter(r => !filterUser || r.userName?.toLowerCase().includes(filterUser?.toLowerCase() || ''))
    .filter(r => !filterDate || r.dataRegistro.toISOString().split('T')[0] === filterDate);


  // Dados para gráficos
  const pieSeries = Object.values(metrics.totalPorTipo);
  const pieLabels = Object.keys(metrics.totalPorTipo).map(t => t[0].toUpperCase() + t.slice(1));
  const barCategories = registros.slice(0, 7).map(r => r.bairro) || ['Nenhum registro'];
  const barSeries = Object.keys(qtdPadrao).map(t => ({
    name: t[0].toUpperCase() + t.slice(1),
    data: registros.slice(0, 7).map(r => r.quantidade[t as keyof typeof qtdPadrao])
  }));

  return (
    <Grid container spacing={4}>
      {/* Configuração de Pontuação */}
      <Grid size={{ xs: 12, md: 12 }}>
        <Card>
          <CardHeader
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            title={
              <Stack spacing={0.5} direction="column" justifyContent="center">
                <Typography variant="h6">Configuração de Pontuação</Typography>
                <Typography variant="caption" color="text.secondary">
                  Modo atual:{' '}
                  {config?.mode === 1 ? '1 - Fixo por Solicitação'
                    : config?.mode === 2 ? '2 - Fixo + Peso Total'
                      : '3 - Fixo + Peso por Tipo'}
                </Typography>
              </Stack>
            }
            action={
              <Button variant="contained" color="success" onClick={() => setOpenConfig(true)}>Configurar</Button>
            }
          />
        </Card>
      </Grid>

      <PointsConfigModal
        open={openConfig}
        onClose={() => setOpenConfig(false)}
        config={config}
        onSave={(cfg) => setConfig(cfg)}
      />

      {/* Formulário de Pesagem */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title="Registrar Pesagem" />
          <CardContent>
            <TextField
              label="Solicitação"
              value={selectedSolicitacao || ''}
              onChange={e => setSelectedSolicitacao(e.target.value)}
              select fullWidth margin="normal"
              color='success'
            >
              {solicitacoesPendentes.length === 0 && (
                <MenuItem disabled value="">Nenhuma solicitação pendente</MenuItem>
              )}
              {solicitacoesPendentes.map(s => (
                <MenuItem key={s.id} value={s.id}>
                  {s.userName} - {s.bairro} - {dayjs(s.date_string).format('DD/MM/YYYY')}
                </MenuItem>
              ))}
            </TextField>

            <Autocomplete
              options={bairros}
              value={selectedBairro || ""}
              onChange={(_, newValue) => setSelectedBairro(newValue || "")}
              renderInput={(params) => <TextField {...params} label="Bairro" color="success" />}
              fullWidth
            />

            {Object.keys(quantidades).map(tipo => (
              <TextField
                key={tipo}
                label={`${tipo[0].toUpperCase() + tipo.slice(1)} (kg)`}
                type="number"
                value={quantidades[tipo as keyof typeof quantidades]}
                onChange={e => handleChangeQuantidade(tipo as keyof typeof quantidades, Number(e.target.value))}
                fullWidth margin="normal"
                color='success'
              />
            ))}

            <Typography sx={{ mt: 2 }}>Total: {totalKgForm.toFixed(2)} kg</Typography>
            <Typography sx={{ mt: 1 }}>Pontos previstos: <strong>{previewPoints}</strong></Typography>
            <Typography sx={{ mt: 1 }}>
              CO₂ evitado previsto: <strong>{WasteRecordService.calcularCO2(quantidades).toFixed(2)} kg</strong>
            </Typography>

            <Button fullWidth variant="contained" color="success" sx={{ mt: 3 }}
              onClick={handleSubmit} disabled={!selectedSolicitacao || !selectedBairro}>
              Registrar
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Métricas e Gráficos */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Grid container spacing={2}>
          {/* Métricas */}
          {[{ title: 'Total Registrado', value: metrics.totalKg.toFixed(2) + ' kg' },
          { title: 'Média por Registro', value: metrics.mediaKg.toFixed(2) + ' kg' },
          { title: 'Registros', value: registros.length }].map((card) => (
            <Grid size={{ xs: 12, md: 4 }} key={card.title}>
              <Card>
                <CardContent>
                  <Typography>{card.title}</Typography>
                  <Typography variant="h5">{card.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Gráficos (Pizza e Barras) */}
          <Grid size={{ xs: 12 }}>
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
                ) : (<Typography>Nenhum registro para exibir gráfico de pizza</Typography>)}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{xs:12}}>
            <Card>
              <CardHeader title="Últimos Registros por Bairro (kg por tipo)" />
              <CardContent>
                {registros.length ? (
                  <Chart
                    type="bar"
                    height={350}
                    series={Object.keys(qtdPadrao).map((tipo) => ({
                      name: tipo[0].toUpperCase() + tipo.slice(1),
                      data: Array.from(new Set(registros.map(r => r.bairro.toLowerCase()))).map((bairro) => {
                        return registros
                          .filter(r => r.bairro.toLowerCase() === bairro)
                          .reduce((sum, r) => sum + r.quantidade[tipo as keyof typeof qtdPadrao], 0);
                      }),
                    }))}
                    options={{
                      chart: {
                        stacked: true,
                        toolbar: { show: true },
                      },
                      plotOptions: {
                        bar: {
                          dataLabels: { position: 'top' },
                        },
                      },
                      colors: Object.keys(coresResiduos).map(
                        (t) => coresResiduos[t as keyof typeof coresResiduos]
                      ),
                      xaxis: {
                        categories: Array.from(new Set(registros.map(r => r.bairro.toLowerCase()))),
                        title: { text: 'Bairros' },
                      },
                      yaxis: {
                        title: { text: 'Kg' },
                      },
                      legend: { position: 'bottom' },
                      tooltip: {
                        y: {
                          formatter: (val: number, { seriesIndex, w }) => {
                            const tipo = w.globals.seriesNames[seriesIndex];
                            return `${tipo}: ${val.toFixed(2)} kg`;
                          },
                        },
                      },
                      annotations: {
                        yaxis: [
                          {
                            y: registros.reduce((acc, r) => acc + r.totalKg, 0) / registros.length,
                            borderColor: '#FF0000',
                            label: {
                              text: 'Média kg',
                              style: { color: '#fff', background: '#FF0000' },
                            },
                          },
                        ],
                      },
                    }}
                  />
                ) : (
                  <Typography>Nenhum registro para exibir gráfico</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Tabela de Registros com Filtros */}
      <Grid size={{ xs: 12, md: 12 }}>
        <Card>
          <CardHeader title="Últimos Registros" />
          <CardContent>
            {/* Filtros */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Filtrar por Usuário"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                variant="outlined"
                size="small"
                color="success"
              />
              <TextField
                label="Filtrar por Data"
                type="date"
                value={filterDate || ''}
                onChange={(e) => setFilterDate(e.target.value || null)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
                color="success"

              />
            </Stack>

            {registrosFiltrados.length === 0 ? (
              <Typography>Nenhum registro encontrado.</Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    {['Usuário', 'Bairro', 'Plástico', 'Papel', 'Vidro', 'Metal', 'Outros', 'Total (kg)', 'Pontos', 'Data'].map((h) => (
                      <TableCell key={h}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrosFiltrados.slice(0, 5).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.userName}</TableCell>
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

      {/* Modal de Sucesso */}
      <Dialog open={openSuccessModal} onClose={() => setOpenSuccessModal(false)}>
        <DialogTitle>Sucesso</DialogTitle>
        <DialogContent>
          <Typography>{successMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuccessModal(false)} color="success">Fechar</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
