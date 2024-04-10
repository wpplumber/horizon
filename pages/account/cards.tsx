import React from 'react';
import {
  withAccountLayout,
  withAuthentication,
} from 'lib/utils/fetch_decorators';
import { getAccountLayout } from 'lib/utils/layout_getters';
import type { GetServerSideProps } from 'next';
import type {
  AccountPageProps,
  NextPageWithLayout,
  PageProps,
} from 'types/shared/pages';
import type { Card } from 'swell-js';
import CardsSection from 'components/CardsSection';
import Button from 'components/atoms/Button';
import { BUTTON_STYLE, BUTTON_TYPE } from 'types/shared/button';
import { useRouter } from 'next/router';
import { fetchAccount } from 'utils/api/fetchAccount';
import { CardProvider } from 'utils/contexts/cardContext';
import { getClientWithSessionToken } from 'lib/graphql/client';
import { fetchCards } from 'utils/api/fetchCards';

export interface SpecialCard extends Card {
  default: boolean;
}

interface CardsPageProps extends PageProps, AccountPageProps {
  cards: SpecialCard[];
  accountId: string | undefined;
}

export const propsCallback: GetServerSideProps<CardsPageProps> = async (
  ctx,
) => {
  const { locale } = ctx;
  const client = getClientWithSessionToken(ctx.req.cookies);
  const {
    data: { account },
  } = await client.getAccountDetails();

  try {
    const userAccount = await fetchAccount(account?.email ?? '');
    const cards = await fetchCards(userAccount.id);
    cards.forEach((card) => {
      if (card.id === userAccount.billing?.account_card_id) {
        card.default = true; // Set default to true
      } else {
        card.default = false; // Set default to false
      }
    });

    return {
      props: {
        accountId: userAccount.id,
        cards,
        pageType: 'cards',
        ...(locale ? { locale } : {}),
      },
    };
  } catch (error) {
    console.error('Error fetching cards:', error);
    return {
      notFound: true,
    };
  }
};

export const getServerSideProps = withAccountLayout(
  withAuthentication(propsCallback),
);

const CardsPage: NextPageWithLayout<CardsPageProps> = ({
  cards,
  accountId,
}) => {
  const router = useRouter();
  const currentRoute = router.pathname;
  const newRoute = `${currentRoute}/new?id=${accountId}`;
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Cards</h2>
      <div className="text-end">
        <Button
          elType={BUTTON_TYPE.LINK}
          href={newRoute}
          onClick={() => null}
          buttonStyle={BUTTON_STYLE.SECONDARY}
          small
          className="mt-4 w-full whitespace-nowrap text-center md:mt-0 md:w-auto">
          Add Card
        </Button>
      </div>
      <CardProvider cards={cards}>
        <CardsSection />
      </CardProvider>
    </div>
  );
};

CardsPage.getLayout = getAccountLayout;

export default CardsPage;
