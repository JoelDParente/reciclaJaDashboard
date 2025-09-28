'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import type { ApexOptions } from 'apexcharts';
import type { SxProps } from '@mui/material/styles';
import { Chart } from '@/components/core/chart';
import { SolicitacaoService } from '@/services/solicitacaoService';

export interface SalesProps {
  sx?: SxProps;
}

export function Sales({ sx }: SalesProps): React.JSX.Element {
  const chartOptions = useChartOptions();
  const [chartSeries, setChartSeries] = React.useState<{ name: string; data: number[] }[]>([]);

  React.useEffect(() => {
  const unsubscribe = SolicitacaoService.listenMonthlyEvolution((monthlyData) => {
    setChartSeries([{ name: 'Coletas', data: monthlyData }]);
  });

  return () => unsubscribe();
}, []);


  return (
    <Card sx={sx}>
      <CardHeader
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}
            onClick={async () => {
              const monthlyData = await SolicitacaoService.fetchMonthlyEvolution();
              setChartSeries([{ name: 'Coletas', data: monthlyData }]);
            }}
          >
            Sincronizar
          </Button>
        }
        title="Evolução mensal das coletas (ano atual)"
      />
      <CardContent>
        <Chart
          height={350}
          options={chartOptions}
          series={chartSeries}
          type="bar"
          width="100%"
        />
      </CardContent>
      <Divider />
    </Card>
  );
}

function useChartOptions(): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent', stacked: false, toolbar: { show: false } },
    colors: [theme.palette.primary.main, alpha(theme.palette.primary.main, 0.25)],
    dataLabels: { enabled: false },
    fill: { opacity: 1, type: 'solid' },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    plotOptions: { bar: { columnWidth: '40px' } },
    stroke: { colors: ['transparent'], show: true, width: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      axisBorder: { color: theme.palette.divider, show: true },
      axisTicks: { color: theme.palette.divider, show: true },
      categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      labels: { offsetY: 5, style: { colors: theme.palette.text.secondary } },
    },
    yaxis: {
      labels: {
        formatter: (value) => `${value}`,
        offsetX: -10,
        style: { colors: theme.palette.text.secondary },
      },
    },
  };
}