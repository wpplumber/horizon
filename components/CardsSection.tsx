import React from 'react';
import { BUTTON_TYPE, BUTTON_STYLE } from 'types/shared/button';
import Button from './atoms/Button';
import useNotificationStore from 'stores/notification';
import { NOTIFICATION_TYPE } from 'types/shared/notification';
// import { useRouter } from 'next/router';
import type { SpecialCard } from 'pages/account/cards';
import { useCardContext } from 'utils/contexts/cardContext';
import { API_BASE_URL } from 'config';

interface CardProps {
  card: SpecialCard;
}

const Card: React.FC<CardProps> = ({ card }) => {
  const send = useNotificationStore((store) => store.send);
  const { cards, setCards } = useCardContext();

  const handleDelete = async (id: string | undefined) => {
    try {
      if (!id) {
        send({
          message: 'Card ID is missing',
          type: NOTIFICATION_TYPE.ERROR,
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/swell/cards/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        send({
          message: 'Card deleted successfully',
          type: NOTIFICATION_TYPE.SUCCESS,
        });

        const updatedCards = cards.filter((card) => card.id !== id);
        setCards(updatedCards); // Update the context with the updated addresses array
      } else {
        send({
          message: 'Failed to delete card',
          type: NOTIFICATION_TYPE.ERROR,
        });
        console.error('Failed to delete card');
      }
    } catch (error) {
      send({
        message: 'Error deleting card',
        type: NOTIFICATION_TYPE.ERROR,
      });
    }
  };

  // const router = useRouter();
  // const currentRoute = router.pathname;

  return (
    <div className="space-y-12 md:mt-12">
      <div className="border-outline relative rounded-xl border bg-background-primary p-6">
        <div className="mb-2 text-lg font-bold">
          {card.brand} ending in {card.last4}
        </div>
        {/* <div>{card.billing?.name}</div>
        <div>{card.billing?.address1}</div>
        {card.billing?.address2 && <div>{card.billing?.address2}</div>}
        <div>
          {card.billing?.city}, {card.billing?.state} {card.billing?.zip}
        </div>
        <div>{card.billing?.country}</div>
        {card.billing?.phone && <div>Phone: {card.billing.phone}</div>} */}
        {card.default && (
          <span className="text-white rounded-md bg-success-light px-2 py-1">
            default
          </span>
        )}
        <div className="absolute bottom-2 right-0 mr-2 mt-2 flex space-x-2">
          {/* <Button
            elType={BUTTON_TYPE.LINK}
            href={`${currentRoute}/edit?id=${card.id}&isDefault=${card.default}`}
            onClick={() => null}
            buttonStyle={BUTTON_STYLE.SECONDARY}
            small
            className="mt-4 w-full whitespace-nowrap text-center md:mt-0 md:w-auto">
            Edit
          </Button> */}
          <Button
            elType={BUTTON_TYPE.BUTTON}
            onClick={() => handleDelete(card.id)}
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

const CardsSection: React.FC = () => {
  const { cards } = useCardContext();
  return (
    <div className="mt-8">
      {cards.map((card) => (
        <Card key={card.id} card={card} />
      ))}
    </div>
  );
};

export default CardsSection;
