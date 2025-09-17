'use client';

import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';
import { SolicitacaoService } from '@/services/solicitacaoService';

export interface TrafficProps {
  sx?: SxProps;
}

export function Traffic({ sx }: TrafficProps): React.JSX.Element {
  const [labels, setLabels] = useState<string[]>([]);
  const [chartSeries, setChartSeries] = useState<number[]>([]);
  const chartOptions = useChartOptions(labels);

  useEffect(() => {
  async function carregar() {
    const { labels, chartSeries } = await SolicitacaoService.getSolicitacoesByBairro();
    setLabels(labels);
    setChartSeries(chartSeries);
  }
  carregar();
}, []);


  return (
    <Card sx={sx}>
      <CardHeader title="Resíduos Coletados por Bairro" />
      <CardContent>
        <Stack spacing={2}>
          <Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            {chartSeries.map((item, index) => (
              <Stack key={labels[index]} spacing={1} sx={{ alignItems: 'center', minWidth: 80 }}>
                <Typography variant="h6">{labels[index]}</Typography>
                <Typography color="text.secondary" variant="subtitle2">
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent' },
    colors: [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main],
    dataLabels: { enabled: false },
    labels,
    legend: { show: false },
    plotOptions: { pie: { expandOnClick: false } },
    states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
  };
}