import { API_BASE_URL } from 'config';
import type { SpecialCard } from 'pages/account/cards';

export async function fetchCards(
  accountId: string | undefined,
): Promise<SpecialCard[]> {
  try {
    const cardsResponse = await fetch(
      `${API_BASE_URL}/api/swell/cards/list?id=${accountId}`,
    );
    const cardsData = await cardsResponse.json();

    return cardsData;
  } catch (error) {
    console.error('Error fetching cards:', error);
    throw error;
  }
}
