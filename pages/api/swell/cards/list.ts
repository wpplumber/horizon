import type { NextApiRequest, NextApiResponse } from 'next';
import { initSwell } from 'lib/swell/swell-node';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id } = req.query;
    const swell = initSwell();
    console.log('Swell account cards id:', id);

    const cards = await swell.get('/accounts:cards/', {
      where: {
        parent_id: {
          $eq: id,
        },
      },
      limit: 25,
      page: 1,
    });
    console.log('Swell account cards response:', cards);

    res.status(200).json(cards.results);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
