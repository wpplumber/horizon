import { API_BASE_URL } from 'config';

export async function submitAddressForm(formData: any, id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/swell/addresses/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
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

export async function updateAddressForm(formData: any, id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/swell/addresses/${id}`, {
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

export async function setDefaultAddress(formData: FormData, id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/swell/accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
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
