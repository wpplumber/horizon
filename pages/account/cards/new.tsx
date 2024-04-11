import React, { useState } from 'react';
import {
  withAccountLayout,
  withAuthentication,
} from 'lib/utils/fetch_decorators';
import { getAccountLayout } from 'lib/utils/layout_getters';
import type { GetServerSideProps } from 'next';
import type {
  AccountPageProps,
  NextPageWithLayout,
  PageProps,
} from 'types/shared/pages';
import { useRouter } from 'next/router';
import Button from 'components/atoms/Button';
import { BUTTON_TYPE } from 'types/shared/button';
import Input from 'components/atoms/Input';
import { NOTIFICATION_TYPE } from 'types/shared/notification';
import useNotificationStore from 'stores/notification';
import GhostButton from 'components/atoms/GhostButton';
import ArrowLeft from 'assets/icons/arrow-left.svg';
import { setDefaultCard, submitCardForm } from 'utils/views/cards';
import { getClientWithSessionToken } from 'lib/graphql/client';
import { ACCOUNT_FIELD } from 'types/account';
import ValidationErrorText from 'components/atoms/ValidationErrorText';
import { createToken } from 'utils/api/createToken';

interface NewPageProps extends PageProps, AccountPageProps {
  email: string | null | undefined;
}

export const propsCallback: GetServerSideProps<NewPageProps> = async (ctx) => {
  const { locale } = ctx;
  const client = getClientWithSessionToken(ctx.req.cookies);
  const {
    data: { account },
  } = await client.getAccountDetails();
  const email = account?.email;
  try {
    return {
      props: {
        email,
        pageType: 'cards',
        ...(locale ? { locale } : {}),
      },
    };
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return {
      notFound: true,
    };
  }
};

export const getServerSideProps = withAccountLayout(
  withAuthentication(propsCallback),
);

const NewPage: NextPageWithLayout<NewPageProps> = ({ email }) => {
  const send = useNotificationStore((store) => store.send);
  const router = useRouter();
  const { id } = router.query;
  const [error, setError] = useState<{
    field: ACCOUNT_FIELD;
    message: string;
  }>();

  const otherError = error?.field === ACCOUNT_FIELD.OTHER;
  const cardNumberError =
    error?.field === ACCOUNT_FIELD.CARDNUMBER || otherError;
  const expirationError =
    error?.field === ACCOUNT_FIELD.EXPIRATION || otherError;
  const cvcError = error?.field === ACCOUNT_FIELD.CVC || otherError;

  const [formValues, setFormValues] = useState({
    email: '', // Required to add card
    cardNumber: '',
    expiration: '',
    cvc: '',
    isDefault: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleCardNumberInput(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const value = input.value.replace(/\D/g, '').substring(0, 16);

    input.value = value.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
  }

  function handleExpirationInput(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const value = input.value.replace(/\D/g, '').substring(0, 4);

    if (value.length > 2) {
      input.value = value.replace(/(\d{2})(\d{2})/, '$1 / $2');
    } else {
      input.value = value;
    }
  }

  function handleCvcInput(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const value = input.value.replace(/\D/g, '').substring(0, 3);
    input.value = value;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formValues.cardNumber === '') {
      setError({
        field: ACCOUNT_FIELD.CARDNUMBER,
        message: 'Card number required',
      });
      return false;
    }
    if (formValues.expiration === '') {
      setError({
        field: ACCOUNT_FIELD.EXPIRATION,
        message: 'Expiration required',
      });
      return false;
    }
    if (formValues.cvc === '') {
      setError({
        field: ACCOUNT_FIELD.CVC,
        message: 'CVC required',
      });
      return false;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (email && id) {
        formValues.email = email?.toString();

        const currentYear = new Date().getFullYear();
        const hundred = Math.floor(currentYear / 100);
        const [month, year] = formValues.expiration.split(' / ');
        const fullYear = `${hundred}${year}`;
        const responseToken = await createToken(
          formValues.cardNumber,
          month,
          fullYear,
          formValues.cvc,
          id.toString(),
        );
        console.log(
          `token:${responseToken.token}, email:${email}, id:${id.toString()}`,
        );
        const response = await submitCardForm(
          responseToken.token,
          email,
          id.toString(),
        );
        if (response && response.billing.errors) {
          send({
            message: response.billing.errors.gateway.message,
            type: NOTIFICATION_TYPE.ERROR,
          });
          return;
        }
        send({
          message: 'Card created with Success',
          type: NOTIFICATION_TYPE.SUCCESS,
        });

        if (formValues.isDefault === true && id) {
          response.billing.email = email;
          await setDefaultCard(response.billing, id.toString());
          send({
            message: 'Default card has been updated',
            type: NOTIFICATION_TYPE.INFO,
          });
        }

        setFormValues({
          email: '',
          cardNumber: '',
          expiration: '',
          cvc: '',
          isDefault: false,
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: checked,
    }));
  };

  return (
    <article className="mx-4 h-full">
      <GhostButton
        elType={BUTTON_TYPE.LINK}
        href="/account/cards"
        className="space-x-1.5">
        <ArrowLeft className="w-[16.6px]" />
        <span>Back to Cards</span>
      </GhostButton>
      <form
        noValidate
        className="mx-auto h-full w-full"
        onSubmit={handleSubmit}>
        <fieldset className="flex h-full w-full flex-1 flex-col">
          <div>
            <legend className="mt-10 w-full text-center">
              <h1 className="font-headings text-2xl font-semibold text-primary md:text-5xl">
                Add Card
              </h1>
            </legend>
            <div className="mt-8 flex flex-col">
              <div className="mt-4 grid grid-cols-3 gap-x-4">
                <p>
                  <label
                    className="text-xs font-semibold uppercase text-primary"
                    htmlFor="cardNumber">
                    Credit Card Number
                  </label>
                  <Input
                    id="cardNumber"
                    type="text"
                    aria-required
                    aria-invalid={cardNumberError}
                    aria-errormessage={
                      cardNumberError ? error.message : undefined
                    }
                    error={cardNumberError}
                    placeholder="#### #### #### ####"
                    value={formValues.cardNumber}
                    onChange={(e) => {
                      handleCardNumberInput(e);
                      handleChange(e);
                    }}
                    name="cardNumber"
                  />

                  {error?.field === ACCOUNT_FIELD.CARDNUMBER && (
                    <ValidationErrorText id="expiration-error">
                      {error.message}
                    </ValidationErrorText>
                  )}
                </p>
                <p>
                  <label
                    className="text-xs font-semibold uppercase text-primary"
                    htmlFor="expiration">
                    Expiration
                  </label>
                  <Input
                    id="expiration"
                    type="text"
                    aria-required
                    aria-invalid={expirationError}
                    aria-errormessage={
                      expirationError ? error.message : undefined
                    }
                    error={expirationError}
                    placeholder="MM / YY"
                    value={formValues.expiration}
                    onChange={(e) => {
                      handleExpirationInput(e);
                      handleChange(e);
                    }}
                    name="expiration"
                  />
                  {error?.field === ACCOUNT_FIELD.EXPIRATION && (
                    <ValidationErrorText id="expiration-error">
                      {error.message}
                    </ValidationErrorText>
                  )}
                </p>
                <p>
                  <label
                    className="text-xs font-semibold uppercase text-primary"
                    htmlFor="cvc">
                    CVC
                  </label>
                  <Input
                    id="cvc"
                    type="text"
                    aria-required
                    aria-invalid={cvcError}
                    aria-errormessage={cvcError ? error.message : undefined}
                    error={cvcError}
                    placeholder="***"
                    value={formValues.cvc}
                    onChange={(e) => {
                      handleCvcInput(e);
                      handleChange(e);
                    }}
                    name="cvc"
                  />

                  {error?.field === ACCOUNT_FIELD.CVC && (
                    <ValidationErrorText id="expiration-error">
                      {error.message}
                    </ValidationErrorText>
                  )}
                </p>
              </div>
              <div className="mt-4 flex items-center">
                <input
                  id="set-card"
                  name="isDefault"
                  value={0}
                  onChange={handleCheckboxChange}
                  type="checkbox"
                  className="border-gray-400 mr-2 flex h-6 w-6 items-center justify-center rounded-md border"
                  checked={formValues.isDefault}
                />
                <label
                  htmlFor="set-card"
                  className="flex cursor-pointer items-center">
                  Set as default
                </label>
              </div>
            </div>
          </div>
          <div className="ml-auto mt-4 flex w-1/4 flex-col gap-2">
            <Button
              elType={BUTTON_TYPE.BUTTON}
              fullWidth
              type="submit"
              disabled={isSubmitting}>
              {'Save'}
            </Button>
          </div>
        </fieldset>
      </form>
    </article>
  );
};

NewPage.getLayout = getAccountLayout;

export default NewPage;
