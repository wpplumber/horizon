import { API_BASE_URL } from 'config';
import type { SpecialAddress } from 'pages/account/addresses';

export async function fetchAddresses(
  accountId: string | undefined,
): Promise<SpecialAddress[]> {
  try {
    const addressesResponse = await fetch(
      `${API_BASE_URL}/api/swell/addresses/list?id=${accountId}`,
    );
    const addressesData = await addressesResponse.json();

    if (!addressesResponse.ok) {
      throw new Error('Failed to fetch addresses');
    }

    return addressesData;
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw error;
  }
}
