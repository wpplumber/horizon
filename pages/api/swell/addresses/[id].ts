import type { NextApiRequest, NextApiResponse } from 'next';
import { initSwell } from 'lib/swell/swell-node';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id } = req.query;
    const swell = initSwell();

    if (req.method === 'GET') {
      const address = await swell.get(`/accounts:addresses/${id}`);

      res.status(200).json(address);
    } else if (req.method === 'POST') {
      const {
        email,
        zip,
        firstName,
        lastName,
        address1,
        city,
        country,
        isDefault,
      } = req.body;
      const addedAddress = await swell.post(`/accounts:addresses`, {
        email,
        zip: zip,
        first_name: firstName,
        last_name: lastName,
        address1,
        city,
        country,
        parent_id: id,
        active: isDefault,
      });
      res.status(200).json({ billing: addedAddress });
    } else if (req.method === 'PUT') {
      const {
        email,
        zip,
        firstName,
        lastName,
        address1,
        city,
        country,
        isDefault,
      } = req.body;
      const updatedAddress = await swell.put(`/accounts:addresses/${id}`, {
        email,
        zip: zip,
        first_name: firstName,
        last_name: lastName,
        address1,
        city,
        country,
        active: isDefault,
      });
      res.status(200).json({ billing: updatedAddress });
    } else if (req.method === 'DELETE') {
      // Logic to delete an address by its ID
      await swell.delete('/accounts:addresses/{id}', {
        id: id,
      });
      res.status(200).json({ message: 'Address deleted successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
