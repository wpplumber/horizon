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
      console.log('Account data', data);
      res.status(200).json({ account: data });
    } else if (req.method === 'POST') {
      // Placeholder for POST request logic
      res.status(501).json({ message: 'POST method not implemented' });
    } else if (req.method === 'DELETE') {
      // Placeholder for DELETE request logic
      res.status(501).json({ message: 'DELETE method not implemented' });
    } else if (req.method === 'PUT') {
      const { id } = req.query;
      console.log(`account id:${id}| email addresss id:${req.body.id}`);
      const newAddress = req.body;
      const accountModified = await swell.put(
        `/accounts/${newAddress.parent_id}`,
        {
          // email: newAddress.email,
          $set: { shipping: newAddress },
        },
      );
      console.log('Update account to add for shipping', accountModified);
      res
        .status(200)
        .json({ message: 'Account shipping modified successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error fetching account data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}