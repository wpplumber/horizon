import { API_BASE_URL } from 'config';

export async function submitCardForm(token: string, email: string, id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/swell/cards/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, email }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit form');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
}

export async function updateCardForm(formData: FormData, id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/swell/cards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Failed to update form');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
}

export async function setDefaultCard(formData: FormData, id: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/swell/accounts/cards/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to submit form');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
}
