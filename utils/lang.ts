import type { AccountNavLinkProps } from 'components/atoms/AccountNavLink';
import type { I18n } from 'hooks/useI18n';

export const pageTitleMap = (i18n: I18n) => ({
  cards: i18n('account.cards.title'),
  addresses: i18n('account.addresses.title'),
  subscriptions: i18n('account.subscriptions.title'),
  orders: i18n('account.orders.title'),
});

export const accountLinks = (i18n: I18n): AccountNavLinkProps[] => [
  {
    label: i18n('account.subscriptions.navigation_title'),
    link: '/account/subscriptions',
  },
  {
    label: i18n('account.orders.navigation_title'),
    link: '/account/orders',
  },
  {
    label: i18n('account.addresses.navigation_title'),
    link: '/account/addresses',
  },
  {
    label: i18n('account.cards.navigation_title'),
    link: '/account/cards',
  },
];
