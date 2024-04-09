import type { SpecialCard } from 'pages/account/cards';

export async function fetchCard(
  id: string | string[] | undefined,
): Promise<SpecialCard> {
  try {
    const cardResponse = await fetch(`/api/swell/cards/${id}`);
    const cardData = await cardResponse.json();
    //  console.log('addressData:', addressData);
    if (!cardData.ok) {
      console.log('cardData:', cardData);
    }

    return cardData;
  } catch (error) {
    console.error('Error fetching card:', error);
    throw error;
  }
}