export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    calendar: '/dashboard/calendar',
    mapa: '/dashboard/mapa',
    pesagem: '/dashboard/pesagem',
    cards: '/dashboard/cards',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
