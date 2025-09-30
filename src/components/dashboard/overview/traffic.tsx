'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import { Chart } from '@/components/core/chart';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Divider } from '@mui/material';

// Firestore
import { db } from '@/firebase/firebaseConfig';
import { collection, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

export interface TrafficProps {
  sx?: SxProps;
}

export function Traffic({ sx }: TrafficProps): React.JSX.Element {
  const [labels, setLabels] = useState<string[]>([]);
  const [chartSeries, setChartSeries] = useState<number[]>([]);
  const [selectedBairro, setSelectedBairro] = useState<string>('');
  const chartOptions = useChartOptions(labels, selectedBairro);

  useEffect(() => {
    const ref = collection(db, 'registro_descarte_global');
    const unsubscribe = onSnapshot(ref, (snapshot: QuerySnapshot<DocumentData>) => {
      const agrupado: Record<string, number> = {};

      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        const bairro = (data.bairro ?? 'desconhecido').toLowerCase();
        const totalKg = data.totalKg ?? 0;

        agrupado[bairro] = (agrupado[bairro] || 0) + totalKg;
      });

      setLabels(Object.keys(agrupado));
      setChartSeries(Object.values(agrupado));
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card sx={sx}>
      <CardHeader title="Total de lixo por bairro" />
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
        </Stack>
      </CardContent>
    </Card>
  );
}

function useChartOptions(labels: string[], selectedBairro: string): ApexOptions {
  const theme = useTheme();

  const baseColors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    labels.forEach((bairro, idx) => {
      map[bairro] = baseColors[idx % baseColors.length];
    });
    return map;
  }, [labels, theme.palette.mode]);

  return {
    chart: {
      background: 'transparent',
      animations: {
        enabled: true,
        speed: 500,
        animateGradually: { enabled: true, delay: 150 },
      },
    },
    colors: labels.map((bairro) =>
      !selectedBairro
        ? colorMap[bairro]
        : bairro === selectedBairro
        ? colorMap[bairro]
        : theme.palette.grey[400]
    ),
    dataLabels: { enabled: false },
    labels,
    legend: { show: false },
    plotOptions: {
      pie: { expandOnClick: false },
    },
    states: {
      active: { filter: { type: 'none' } },
      hover: { filter: { type: 'none' } },
    },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: {
      y: { formatter: (val: number) => `${val.toFixed(2)} kg` },
      fillSeriesColor: false,
    },
    fill: { opacity: 1 },
  };
}