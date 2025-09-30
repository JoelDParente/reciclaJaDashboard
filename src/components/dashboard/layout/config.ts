import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Visão Geral', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'calendar', title: 'Calendário', href: paths.dashboard.calendar, icon: 'calendar-month' },
  { key: 'cards', title: 'Cartões', href: paths.dashboard.cards, icon: 'card' },
  { key: 'customers', title: 'Denúncias', href: paths.dashboard.customers, icon: 'warning' },
  { key: 'mapa', title: 'Localização dos PEVs', href: paths.dashboard.mapa, icon: 'map' },
  { key: 'pesagem', title: 'Pesagem de resíduos', href: paths.dashboard.pesagem, icon: 'scales' },
] satisfies NavItemConfig[];
