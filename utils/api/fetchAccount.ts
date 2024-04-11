import { API_BASE_URL } from 'config';
import type { Account } from 'swell-js';

export async function fetchAccount(email: string): Promise<Account> {
  try {
    const accountResponse = await fetch(
      `${API_BASE_URL}/api/swell/accounts/${encodeURIComponent(email)}`,
    );
    const accountData = await accountResponse.json();

    if (!accountResponse.ok) {
      throw new Error('Failed to fetch account data');
    }

    return accountData.account;
  } catch (error) {
    console.error('Error fetching account data:', error);
    throw error;
  }
}
