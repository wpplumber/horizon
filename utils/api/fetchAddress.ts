import { API_BASE_URL } from 'config';
import type { SpecialAddress } from 'pages/account/addresses';

export async function fetchAddress(
  id: string | string[] | undefined,
): Promise<SpecialAddress> {
  try {
    const addressResponse = await fetch(
      `${API_BASE_URL}/api/swell/addresses/${id}`,
    );
    const addressData = await addressResponse.json();
    //  console.log('addressData:', addressData);
    if (!addressData.ok) {
      // console.log('addressData:', addressData);
    }

    return addressData;
  } catch (error) {
    console.error('Error fetching address:', error);
    throw error;
  }
}
