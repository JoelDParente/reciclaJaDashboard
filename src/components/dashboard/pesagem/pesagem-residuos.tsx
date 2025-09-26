// src/components/dashboard/pesagem/pesagem-residuos.tsx
'use client';

import * as React from 'react';
import {
  Card, CardContent, CardHeader, Grid, TextField,
  MenuItem, Button, Typography, Stack
} from '@mui/material';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { Modal, Box } from '@mui/material';

import { WasteRecord } from '@/models/wasteRecord';
import { PointsConfig } from '@/models/points';
import { PointsConfigDAO } from '@/daos/pointsConfigDAO';
import { Quantidades } from '@/models/wasteRecord';
import { PointsDAO } from '@/daos/pointsDAO';
import { PointsService } from '@/services/pointsService';
import { WasteRecordService } from '@/services/wasteRecordService';
import { SolicitacaoService } from '@/services/solicitacaoService';
import { BairroService } from '@/services/bairrosService';
import { SolicitacaoColeta } from '@/models/solicitacao';
import { Chart } from '@/components/core/chart';
import { PesagemResiduosProps } from './pesagem-residuos-wrapper';

const coresResiduos = {
  plastico: '#2FB166',
  papel: '#FFD700',
  vidro: '#1E90FF',
  metal: '#FF4500',
  organico: '#32CD32',
  outros: '#808080',
};

interface MetricCard {
  title: string;
  value: string | number;
}

export function PesagemResiduos({ userId }: PesagemResiduosProps) {
  const wasteService = React.useMemo(() => new WasteRecordService(), []);
  const pointsConfigDAO = React.useMemo(() => new PointsConfigDAO(), []);
  const pointsDAO = React.useMemo(() => new PointsDAO(), []);
  const bairroService = React.useMemo(() => new BairroService(), []);

  // tipos que usamos no formulário (atenção: alinhar com seu modelo)
  const qtdPadrao = { plastico: 0, papel: 0, vidro: 0, metal: 0, outros: 0 } as Record<string, number>;

  // valores default locais (apenas para iniciar UI caso DB esteja vazio)
  const valoresDefault = { plastico: 15, papel: 10, vidro: 20, metal: 20, outros: 5 } as Record<string, number>;

  const [quantidades, setQuantidades] = React.useState<Record<string, number>>({ ...qtdPadrao });
  const [registros, setRegistros] = React.useState<WasteRecord[]>([]);
  const [config, setConfig] = React.useState<PointsConfig | null>(null);
  const [previewPoints, setPreviewPoints] = React.useState<number>(0);
  const [isSavingConfig, setIsSavingConfig] = React.useState(false);
  const [openConfigModal, setOpenConfigModal] = React.useState(false);

  const [solicitacoesPendentes, setSolicitacoesPendentes] = React.useState<SolicitacaoColeta[]>([]);
  const [selectedSolicitacao, setSelectedSolicitacao] = React.useState<string | null>(null);

  const [bairros, setBairros] = React.useState<string[]>([]);
  const [selectedBairro, setSelectedBairro] = React.useState<string>('');

  const [metrics, setMetrics] = React.useState({
    totalKg: 0,
    totalPorTipo: { ...qtdPadrao },
    mediaKg: 0,
  });

  const totalKgForm = Object.values(quantidades).reduce((acc, v) => acc + (Number(v) || 0), 0);

  const handleOpenConfigModal = () => setOpenConfigModal(true);
  const handleCloseConfigModal = () => setOpenConfigModal(false);


  // helper: garante que materialWeights tenha todas as chaves e números válidos
  const normalizeMaterialWeights = (mw: Record<string, number> | undefined) => {
    const keys = Object.keys(qtdPadrao);
    const out: Record<string, number> = {};
    keys.forEach(k => {
      const val = mw?.[k];
      out[k] = typeof val === 'number' && !Number.isNaN(val) ? val : (val === 0 ? 0 : (val ? Number(val) : valoresDefault[k]));
    });
    return out;
  };

  // Carregar configuração de pontos (e inicializar se não existir)
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cfg = await pointsConfigDAO.getCurrentConfig();
        if (!mounted) return;
        if (cfg) {
          // normaliza materialWeights para evitar undefined/strings
          cfg.materialWeights = normalizeMaterialWeights(cfg.materialWeights);
          setConfig(cfg);
        } else {
          // criar uma config padrão local (não salva automaticamente)
          const defaultCfg: PointsConfig = {
            mode: 3,
            fixedPoints: 10,
            pointsPerKg: 0,
            materialWeights: normalizeMaterialWeights(undefined),
            updatedAt: new Date(),
          };
          setConfig(defaultCfg);
        }
      } catch (err) {
        console.error('Erro carregando config de pontos:', err);
      }
    })();
    return () => { mounted = false; };
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
  const loadSolicitacoes = React.useCallback(async () => {
    const todas = await SolicitacaoService.getAllSolicitacoes();
    setSolicitacoesPendentes(todas.filter(s => !s.status));
  }, []);

  React.useEffect(() => { loadSolicitacoes(); }, [loadSolicitacoes]);

  // Carregar bairros
  React.useEffect(() => {
    bairroService.listarCidades().then(data => {
      const lista: string[] = data.flatMap(c => c.bairros);
      setBairros(lista);
    });
  }, [bairroService]);

  // Atualizar preview de pontos sempre que config, quantidades ou total mudarem
  React.useEffect(() => {
    if (!config) return;
    // garantir materialWeights numéricos
    const safeConfig: PointsConfig = {
      ...config,
      materialWeights: normalizeMaterialWeights(config.materialWeights),
    };
    const res = PointsService.calculatePoints(safeConfig, quantidades as any, totalKgForm);
    setPreviewPoints(res.totalPoints);
  }, [config, quantidades, totalKgForm]);

  const handleChangeQuantidade = (tipo: string, value: number) => {
    setQuantidades(prev => ({ ...prev, [tipo]: Number(value) || 0 }));
  };

  // salvar config no Firestore
  const handleSaveConfig = async () => {
    if (!config) return;
    setIsSavingConfig(true);
    try {
      // normaliza antes de salvar
      const toSave: PointsConfig = {
        ...config,
        fixedPoints: Number(config.fixedPoints) || 0,
        pointsPerKg: Number(config.pointsPerKg) || 0,
        materialWeights: normalizeMaterialWeights(config.materialWeights),
        updatedAt: new Date(),
      };
      await pointsConfigDAO.saveConfig(toSave);
      // recarrega do banco (garante que os tipos / timestamp estejam corretos)
      const reloaded = await pointsConfigDAO.getCurrentConfig();
      if (reloaded) {
        reloaded.materialWeights = normalizeMaterialWeights(reloaded.materialWeights);
        setConfig(reloaded);
      } else {
        setConfig(toSave);
      }
      alert('Configuração salva com sucesso ✅');
      console.log('Config salva:', toSave);
    } catch (err) {
      console.error('Erro ao salvar config:', err);
      alert('Erro ao salvar configuração. Verifique permissões do Firestore e console.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSolicitacao || !selectedBairro || !config) return alert('Selecione solicitação, bairro e verifique a configuração.');

    const solicitacao = solicitacoesPendentes.find(s => s.id === selectedSolicitacao);
    if (!solicitacao) return;

    const pontos = PointsService.calculatePoints(config, quantidades as any, totalKgForm).totalPoints;
    const novoRegistro: Omit<WasteRecord, 'id'> = {
      userId: solicitacao.userId,
      bairro: selectedBairro,
      cidade: 'Morada Nova',
      dataRegistro: new Date(),
      quantidade: quantidades as any,
      totalKg: totalKgForm,
      pontos,
    };

    await wasteService.registrar(solicitacao.userId, novoRegistro);
    await pointsDAO.addUserPoints(solicitacao.userId, pontos, "pesagem");
    await SolicitacaoService.updateSolicitacao(solicitacao.id!, { status: true });

    alert(`Pesagem registrada ✅ +${pontos} pontos para ${solicitacao.userName}`);

    setQuantidades({ ...qtdPadrao });
    setSelectedSolicitacao(null);
    setSelectedBairro('');
    loadRegistros();
    loadSolicitacoes();
  };

  // Dados para gráficos
  const pieSeries = Object.values(metrics.totalPorTipo);
  const pieLabels = Object.keys(metrics.totalPorTipo).map(t => t[0].toUpperCase() + t.slice(1));
  const barCategories = registros.slice(0, 7).map(r => r.bairro) || ['Nenhum registro'];
  const materiais: (keyof Quantidades)[] = [
    "plastico",
    "papel",
    "vidro",
    "metal",
    "outros",
  ];

  const barSeries = materiais.map((t: keyof Quantidades) => ({
    name: t[0].toUpperCase() + t.slice(1),
    data: registros.slice(0, 7).map((r) => r.quantidade[t]),
  }));



  // tipos de material para renderização dos inputs de configuração
  const materialKeys = Object.keys(qtdPadrao);

  return (

    <Grid container spacing={3}>

      {/* Modal de Configuração de Pontos */}
      <Modal
        open={openConfigModal}
        onClose={handleCloseConfigModal}
      >
        <Box
          sx={{
            position: 'absolute' as const,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          {config ? (
            <>
              <Typography variant="h6" mb={2}>
                Configurar Pontos
              </Typography>
              <TextField
                select
                label="Modelo de Cálculo"
                value={config.mode}
                onChange={(e) =>
                  setConfig(prev => ({ ...(prev as PointsConfig), mode: Number(e.target.value) as 1 | 2 | 3 }))
                }
                fullWidth
                margin="normal"
              >
                <MenuItem value={1}>1 - Fixa por Solicitação</MenuItem>
                <MenuItem value={2}>2 - Fixa + Peso Total</MenuItem>
                <MenuItem value={3}>3 - Fixa + Peso por Tipo</MenuItem>
              </TextField>

              <TextField
                label="Pontos Fixos"
                type="number"
                value={config.fixedPoints}
                onChange={(e) => setConfig(prev => ({ ...(prev as PointsConfig), fixedPoints: Number(e.target.value) || 0 }))}
                fullWidth
                margin="normal"
              />

              {config.mode === 2 && (
                <TextField
                  label="Pontos por Kg (total)"
                  type="number"
                  value={config.pointsPerKg}
                  onChange={(e) => setConfig(prev => ({ ...(prev as PointsConfig), pointsPerKg: Number(e.target.value) || 0 }))}
                  fullWidth
                  margin="normal"
                />
              )}

              {config.mode === 3 && (
                <Box sx={{ mt: 2 }}>
                  {Object.keys(qtdPadrao).map(k => (
                    <TextField
                      key={k}
                      label={`${k[0].toUpperCase() + k.slice(1)} (pontos/kg)`}
                      type="number"
                      value={(config.materialWeights && config.materialWeights[k]) ?? valoresDefault[k]}
                      onChange={(e) => {
                        const num = Number(e.target.value);
                        setConfig(prev => {
                          const prevCfg = prev as PointsConfig;
                          return {
                            ...prevCfg,
                            materialWeights: {
                              ...(prevCfg.materialWeights || {}),
                              [k]: Number.isNaN(num) ? 0 : num,
                            }
                          };
                        });
                      }}
                      fullWidth
                      margin="dense"
                    />
                  ))}
                </Box>
              )}

              <Box mt={2} display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={handleCloseConfigModal}>
                  Cancelar
                </Button>
                <Button variant="contained" color="success" onClick={handleSaveConfig}>
                  Salvar
                </Button>
              </Box>
            </>
          ) : (
            <Typography>Carregando configuração...</Typography>
          )}
        </Box>
      </Modal>
      {/* Formulário de pesagem */}
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
                  {s.userName} - {s.bairro} ({s.date_string})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Bairro"
              value={selectedBairro}
              onChange={e => setSelectedBairro(e.target.value)}
              select fullWidth margin="normal"
              color='success'
            >
              {bairros.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
            </TextField>

            {Object.keys(qtdPadrao).map(tipo => (
              <TextField
                key={tipo}
                label={`${tipo[0].toUpperCase() + tipo.slice(1)} (kg)`}
                type="number"
                value={quantidades[tipo] ?? 0}
                onChange={e => handleChangeQuantidade(tipo, Number(e.target.value))}
                fullWidth margin="normal"
              />
            ))}

            <Typography sx={{ mt: 2 }}>Total: {totalKgForm.toFixed(2)} kg</Typography>
            <Typography sx={{ mt: 1 }}>Pontos previstos: <strong>{previewPoints}</strong></Typography>

            <Button fullWidth variant="contained" color="success" sx={{ mt: 3 }}
              onClick={handleSubmit} disabled={!selectedSolicitacao || !selectedBairro}>
              Registrar
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Métricas e Gráficos */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Grid container spacing={1}>
          {/* Métricas */}
          {(
            [
              { title: 'Total Registrado', value: metrics.totalKg.toFixed(2) + ' kg' },
              { title: 'Média por Registro', value: metrics.mediaKg.toFixed(2) + ' kg' },
              { title: 'Registros', value: registros.length },
            ] as MetricCard[]
          ).map((card) => (
            <Grid size={{ xs: 12, md: 4 }} key={card.title}>
              <Card>
                <CardContent>
                  <Typography>{card.title}</Typography>
                  <Typography variant="h5">{card.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

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
                    {['Usuário', 'Bairro', 'Plástico', 'Papel', 'Vidro', 'Metal', 'Outros', 'Total (kg)', 'Pontos', 'Data'].map(
                      (h) => (<TableCell key={h}>{h}</TableCell>)
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registros.slice(0, 10).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{solicitacoesPendentes.find(s => s.userId === r.userId)?.userName || 'N/A'}</TableCell>
                      <TableCell>{r.bairro}</TableCell>
                      {(Object.keys(qtdPadrao) as (keyof Quantidades)[]).map((t) => (
                        <TableCell key={t}>{r.quantidade[t]}</TableCell>
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