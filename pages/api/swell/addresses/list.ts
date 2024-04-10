import type { NextApiRequest, NextApiResponse } from 'next';
import { initSwell } from 'lib/swell/swell-node';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id } = req.query;
    const swell = initSwell();
    const addresses = await swell.get('/accounts:addresses/', {
      where: {
        parent_id: {
          $eq: id,
        },
      },
      limit: 25,
      page: 1,
    });

    res.status(200).json(addresses.results);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
