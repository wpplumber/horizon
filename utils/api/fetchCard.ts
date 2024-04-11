import { API_BASE_URL } from 'config';
import type { SpecialCard } from 'pages/account/cards';

export async function fetchCard(
  id: string | string[] | undefined,
): Promise<SpecialCard> {
  try {
    const cardResponse = await fetch(`${API_BASE_URL}/api/swell/cards/${id}`);
    const cardData = await cardResponse.json();
    if (!cardData.ok) {
      // console.log('cardData:', cardData);
    }

    return cardData;
  } catch (error) {
    console.error('Error fetching card:', error);
    throw error;
  }
}
