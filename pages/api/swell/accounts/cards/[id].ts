import type { NextApiRequest, NextApiResponse } from 'next';
import { initSwell } from 'lib/swell/swell-node';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const swell = initSwell();

    if (req.method === 'GET') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res
          .status(400)
          .json({ error: 'Email parameter is missing or invalid' });
      }

      const response = await swell.get('/accounts', {
        where: {
          email: {
            $eq: id,
          },
        },
        limit: 25,
        page: 1,
      });

      const data = response.results[0];
      res.status(200).json({ account: data });
    } else if (req.method === 'POST') {
      // Placeholder for POST request logic
      res.status(501).json({ message: 'POST method not implemented' });
    } else if (req.method === 'DELETE') {
      // Placeholder for DELETE request logic
      res.status(501).json({ message: 'DELETE method not implemented' });
    } else if (req.method === 'PUT') {
      const newCard = req.body;
      await swell.put(`/accounts/${newCard.parent_id}`, {
        email: newCard.email,
        $set: { 'billing.account_card_id': req.body.id },
      });
      res
        .status(200)
        .json({ message: 'Account billing modified successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error fetching account data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
