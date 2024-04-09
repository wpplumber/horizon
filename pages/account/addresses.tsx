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
import type { Address } from 'swell-js';
import AddressesSection from 'components/AddressesSection';
import Button from 'components/atoms/Button';
import { BUTTON_STYLE, BUTTON_TYPE } from 'types/shared/button';
import { useRouter } from 'next/router';
import { fetchAddresses } from 'utils/api/fetchAddresses';
import { fetchAccount } from 'utils/api/fetchAccount';
import { AddressProvider } from 'utils/contexts/addressContext';
import { getClientWithSessionToken } from 'lib/graphql/client';

export interface SpecialAddress extends Address {
  default: boolean | undefined;
}

interface AddressesPageProps extends PageProps, AccountPageProps {
  addresses: SpecialAddress[];
  accountId: string | undefined;
}

export const propsCallback: GetServerSideProps<AddressesPageProps> = async (
  ctx,
) => {
  const { locale } = ctx;
  const client = getClientWithSessionToken(ctx.req.cookies);
  const {
    data: { account },
  } = await client.getAccountDetails();

  try {
    const userAccount = await fetchAccount(account?.email ?? '');
    const addresses = await fetchAddresses(userAccount.id);
    // Iterate over addresses array
    addresses.forEach((address) => {
      // Check if the address id matches the userAccount.shipping.account_address_id
      if (address.id === userAccount.shipping?.account_address_id) {
        address.default = true; // Set default to true
      } else {
        address.default = false; // Set default to false
      }
    });

    return {
      props: {
        accountId: userAccount.id,
        addresses,
        pageType: 'addresses',
        ...(locale ? { locale } : {}),
      },
    };
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return {
      notFound: true,
    };
  }
};

export const getServerSideProps = withAccountLayout(
  withAuthentication(propsCallback),
);

const AddressesPage: NextPageWithLayout<AddressesPageProps> = ({
  addresses,
  accountId,
}) => {
  const router = useRouter();
  const currentRoute = router.pathname;
  const newRoute = `${currentRoute}/new?id=${accountId}`;

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Addresses</h2>
      <div className="text-end">
        <Button
          elType={BUTTON_TYPE.LINK}
          href={newRoute}
          onClick={() => null}
          buttonStyle={BUTTON_STYLE.SECONDARY}
          small
          className="mt-4 w-full whitespace-nowrap text-center md:mt-0 md:w-auto">
          Add Address
        </Button>
      </div>
      <AddressProvider addresses={addresses}>
        <AddressesSection />
      </AddressProvider>
    </div>
  );
};

AddressesPage.getLayout = getAccountLayout;

export default AddressesPage;
