import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { CalendarDotsIcon } from '@phosphor-icons/react/dist/ssr/CalendarDots';
import { PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { Recycle } from '@phosphor-icons/react/dist/ssr/Recycle';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { Scales } from '@phosphor-icons/react/dist/ssr/Scales';
import { Warning } from '@phosphor-icons/react/dist/ssr/Warning';
import { Cards } from '@phosphor-icons/react/dist/ssr/Cards';

export const navIcons = {
  'calendar-month': CalendarDotsIcon,
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'card': Cards,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  'map': Recycle,
  'scales': Scales,
  'warning':Warning,
  user: UserIcon,
  users: UsersIcon,
} as Record<string, Icon>;
