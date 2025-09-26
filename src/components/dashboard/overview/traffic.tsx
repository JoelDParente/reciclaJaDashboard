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
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useMemo } from "react";
import { Divider } from '@mui/material';

export interface TrafficProps {
  sx?: SxProps;
}

export function Traffic({ sx }: TrafficProps): React.JSX.Element {
  const [labels, setLabels] = useState<string[]>([]);
  const [chartSeries, setChartSeries] = useState<number[]>([]);
  const [selectedBairro, setSelectedBairro] = useState<string>('');
  const chartOptions = useChartOptions(labels, selectedBairro);

  useEffect(() => {
    async function carregar() {
      const { labels, chartSeries } =
        await SolicitacaoService.getSolicitacoesByBairro();
      setLabels(labels);
      setChartSeries(chartSeries);
    }
    carregar();
  }, []);

  return (
    <Card sx={sx}>
      <CardHeader title="Solicitações Pendentes" />
      <CardContent>
        <Stack spacing={2}>

          <Chart
            height={300}
            options={chartOptions}
            series={chartSeries}
            type="donut"
            width="100%"
          />
          <Divider />
          <Select
            value={selectedBairro}
            onChange={(e) => setSelectedBairro(e.target.value)}
            displayEmpty
            fullWidth
            size="small"
          >
            <MenuItem value="">
              <em>Selecionar bairro</em>
            </MenuItem>
            {labels.map((bairro) => (
              <MenuItem key={bairro} value={bairro}>
                {bairro}
              </MenuItem>
            ))}
          </Select>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {chartSeries.map((item, index) => (
              <Stack
                key={labels[index]}
                spacing={1}
                sx={{ alignItems: 'center', minWidth: 80 }}
              >
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function useChartOptions(labels: string[], selectedBairro: string): ApexOptions {
  const theme = useTheme();

  // Paleta fixa para cada bairro (com fallback cíclico se tiver mais bairros que cores)
  const baseColors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  // Garante cores consistentes para cada label
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    labels.forEach((bairro, idx) => {
      map[bairro] = baseColors[idx % baseColors.length];
    });
    return map;
  }, [labels, theme.palette.mode]);

  return {
    chart: {
      background: "transparent", animations: {
        enabled: true,
        speed: 500, // velocidade do fade (ms)
        animateGradually: { enabled: true, delay: 150 }
      }
    },
    colors: labels.map((bairro) => {
      if (!selectedBairro) {
        // Nenhum selecionado → cada bairro com sua cor
        return colorMap[bairro];
      }
      // Selecionado → mantém cor original do bairro escolhido, outros ficam cinza
      return bairro === selectedBairro
        ? colorMap[bairro]
        : theme.palette.grey[400];
    }),
    dataLabels: { enabled: false },
    labels,
    legend: { show: false },
    plotOptions: {
      pie: {
        expandOnClick: false,
      },
    },
    states: {
      active: { filter: { type: "none" } },
      hover: { filter: { type: "none" } },
    },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
    // Suaviza transição entre cores
    fill: {
      opacity: 1,
    },
  };
}