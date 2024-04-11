import React from 'react';
import { BUTTON_TYPE, BUTTON_STYLE } from 'types/shared/button';
import Button from './atoms/Button';
import useNotificationStore from 'stores/notification';
import { NOTIFICATION_TYPE } from 'types/shared/notification';
import { useAddressContext } from 'utils/contexts/addressContext';
import { useRouter } from 'next/router';
import type { SpecialAddress } from 'pages/account/addresses';
import { API_BASE_URL } from 'config';

interface AddressProps {
  address: SpecialAddress;
}

const AddressCard: React.FC<AddressProps> = ({ address }) => {
  const send = useNotificationStore((store) => store.send);
  const { addresses, setAddresses } = useAddressContext();

  const handleDelete = async (id: string | undefined) => {
    try {
      if (!id) {
        send({
          message: 'Address ID is missing',
          type: NOTIFICATION_TYPE.ERROR,
        });
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/swell/addresses/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        send({
          message: 'Address deleted successfully',
          type: NOTIFICATION_TYPE.SUCCESS,
        });
        // Remove the deleted address from the addresses array
        const updatedAddresses = addresses.filter((addr) => addr.id !== id);
        setAddresses(updatedAddresses); // Update the context with the updated addresses array
      } else {
        send({
          message: 'Failed to delete address',
          type: NOTIFICATION_TYPE.ERROR,
        });
        console.error('Failed to delete address');
      }
    } catch (error) {
      send({
        message: 'Error deleting address',
        type: NOTIFICATION_TYPE.ERROR,
      });
    }
  };

  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <div className="space-y-12 md:mt-12">
      <div className="border-outline relative rounded-xl border bg-background-primary p-6">
        <div className=" text-md text-body">{address.name}</div>
        <div className=" text-md text-body">{address.address1}</div>
        {address.address2 && (
          <div className=" text-md text-body">{address.address2}</div>
        )}
        <div className=" text-md text-body">
          {address.city}, {address.state} {address.zip}
        </div>
        <div className=" text-md text-body">{address.country}</div>
        {address.phone && (
          <div className=" text-md text-body">Phone: {address.phone}</div>
        )}
        {address.company && (
          <div className=" text-md text-body">Company: {address.company}</div>
        )}
        {address.default && (
          <span className="text-white rounded-md bg-success-light px-2 py-1">
            default
          </span>
        )}
        <div className="absolute bottom-2 right-0 mr-2 mt-2 flex space-x-2">
          <Button
            elType={BUTTON_TYPE.LINK}
            href={`${currentRoute}/edit?id=${address.id}&isDefault=${address.default}`}
            onClick={() => null}
            buttonStyle={BUTTON_STYLE.SECONDARY}
            small
            className="mt-4 w-full whitespace-nowrap text-center md:mt-0 md:w-auto">
            Edit
          </Button>
          <Button
            elType={BUTTON_TYPE.BUTTON}
            onClick={() => handleDelete(address.id)}
            buttonStyle={BUTTON_STYLE.SECONDARY}
            small
            className="mt-4 w-full whitespace-nowrap text-center md:mt-0 md:w-auto">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

const AddressesSection: React.FC = () => {
  const { addresses } = useAddressContext();
  return (
    <div className="mt-8">
      {addresses.map((address) => (
        <AddressCard key={address.id} address={address} />
      ))}
    </div>
  );
};

export default AddressesSection;
