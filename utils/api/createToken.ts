import { initSwell } from 'lib/swell/swell-js';

export async function createToken(
  cardNumber: string,
  expMonth: string,
  expYear: string,
  cvcNumber: string,
  accountID: string,
): Promise<any> {
  try {
    const swell = initSwell();
    const cardResponse = await swell.card.createToken({
      number: cardNumber,
      exp_month: expMonth,
      exp_year: expYear,
      cvc: cvcNumber,
      // // Note: some payment gateways may require a Swell `account_id` and `billing` for card verification (Braintree)
      account_id: accountID,
      // billing: {
      //   address1: '1 Main Dr.',
      //   zip: 90210
      //   // Other standard billing fields optional
      // }
    });

    // const cardData = await cardResponse.$data;
    // if (!cardData.ok) {
    //   console.log('cardData:', cardData);
    // }
    //  console.log('Create token response:', cardData.token);
    return cardResponse;
  } catch (error) {
    console.error('Error fetching card:', error);
    // throw error;
  }
}
