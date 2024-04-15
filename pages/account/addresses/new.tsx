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
import { setDefaultAddress, submitAddressForm } from 'utils/views/addresses';
import { getClientWithSessionToken } from 'lib/graphql/client';
import { ACCOUNT_FIELD } from 'types/account';
import ValidationErrorText from 'components/atoms/ValidationErrorText';
import countriesData from 'data/countries.json';
import useClassNames from 'hooks/useClassNames';

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
        pageType: 'addresses',
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
  const countries = countriesData.map((country) => ({
    code: country.code,
    name: country.name,
  }));

  const otherError = error?.field === ACCOUNT_FIELD.OTHER;
  const addressError = error?.field === ACCOUNT_FIELD.ADDRESS || otherError;
  const countryError = error?.field === ACCOUNT_FIELD.COUNTRY || otherError;

  const [formValues, setFormValues] = useState({
    email: '', // Required to add address
    zip: '',
    firstName: '',
    lastName: '',
    address1: '',
    city: '',
    country: '',
    isDefault: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formValues.address1 === '') {
      setError({
        field: ACCOUNT_FIELD.ADDRESS,
        message: 'Address required',
      });
      return false;
    }
    if (formValues.country === '') {
      setError({
        field: ACCOUNT_FIELD.COUNTRY,
        message: 'Country required',
      });
      return false;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (email && id) {
        formValues.email = email;
        const formData = new FormData();
        formData.append('email', formValues.email);
        formData.append('zip', formValues.zip);
        formData.append('firstName', formValues.firstName);
        formData.append('lastName', formValues.lastName);
        formData.append('address1', formValues.address1);
        formData.append('city', formValues.city);
        formData.append('country', formValues.country);
        formData.append('isDefault', formValues.isDefault.toString());
        const response = await submitAddressForm(formData, id?.toString());

        send({
          message: 'Address created with Success',
          type: NOTIFICATION_TYPE.SUCCESS,
        });

        if (formValues.isDefault === true) {
          response.billing.email = email;
          await setDefaultAddress(response.billing, id?.toString());
          send({
            message: 'Default card has been updated',
            type: NOTIFICATION_TYPE.INFO,
          });
        }

        setFormValues({
          email: '',
          zip: '',
          firstName: '',
          lastName: '',
          address1: '',
          city: '',
          country: '',
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

  const classNames = useClassNames(
    'peer w-full rounded-lg border p-4 text-md text-primary transition duration-300',
    'focus:text-primary focus:outline-none',
    'placeholder:text-input-standard',
    'disabled:border-disabled disabled:text-disabled',
    {
      'border-primary placeholder-shown:border-input-standard focus:border-primary':
        !error,
      'border-error-dark': !!error,
    },
  );

  return (
    <article className="mx-4 h-full">
      <GhostButton
        elType={BUTTON_TYPE.LINK}
        href="/account/addresses"
        className="space-x-1.5">
        <ArrowLeft className="w-[16.6px]" />
        <span>Back to Addresses</span>
      </GhostButton>
      <form
        noValidate
        className="mx-auto h-full w-full"
        onSubmit={handleSubmit}>
        <fieldset className="flex h-full w-full flex-1 flex-col">
          <div>
            <legend className="mt-10 w-full text-center">
              <h1 className="font-headings text-2xl font-semibold text-primary md:text-5xl">
                Add Address
              </h1>
            </legend>
            <div className="mt-8 flex flex-col">
              <div className="mt-4 grid grid-cols-2 gap-x-4">
                <p>
                  <label
                    className="text-xs font-semibold uppercase text-primary"
                    htmlFor="firstName">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formValues.firstName}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    name="firstName"
                  />
                </p>
                <p>
                  <label
                    className="text-xs font-semibold uppercase text-primary"
                    htmlFor="lastName">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formValues.lastName}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    name="lastName"
                  />
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-4">
                <p>
                  <label
                    className="text-xs font-semibold uppercase text-primary"
                    htmlFor="address1">
                    Address
                  </label>
                  <Input
                    id="address1"
                    type="text"
                    aria-required
                    aria-invalid={addressError}
                    aria-errormessage={addressError ? error.message : undefined}
                    error={addressError}
                    value={formValues.address1}
                    onChange={(e) => {
                      setError(undefined);
                      handleChange(e);
                    }}
                    name="address1"
                  />
                  {error?.field === ACCOUNT_FIELD.ADDRESS && (
                    <ValidationErrorText id="address1-error">
                      {error.message}
                    </ValidationErrorText>
                  )}
                </p>
                <p>
                  <label
                    className="text-xs font-semibold uppercase text-primary"
                    htmlFor="email">
                    ZIP
                  </label>
                  <Input
                    id="zip"
                    type="text"
                    aria-required
                    value={formValues.zip}
                    onChange={handleChange}
                    name="zip"
                  />
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-4">
                <p>
                  <label
                    className="text-xs font-semibold uppercase text-primary"
                    htmlFor="city">
                    City
                  </label>
                  <Input
                    id="city"
                    type="text"
                    aria-required
                    value={formValues.city}
                    onChange={handleChange}
                    name="city"
                  />
                </p>
                <p>
                  <label
                    className="text-xs font-semibold uppercase text-primary"
                    htmlFor="country">
                    Country
                  </label>
                  <select
                    className={classNames}
                    id="country"
                    aria-required
                    aria-invalid={countryError}
                    aria-errormessage={countryError ? error.message : undefined}
                    value={formValues.country}
                    onChange={() => {
                      setError(undefined);
                      handleChange;
                    }}
                    name="country">
                    <option value=""></option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {error?.field === ACCOUNT_FIELD.COUNTRY && (
                    <ValidationErrorText id="country-error">
                      {error.message}
                    </ValidationErrorText>
                  )}
                </p>
              </div>
              <div className="mt-4 flex items-center">
                <input
                  id="set-address"
                  name="isDefault"
                  value={0}
                  onChange={handleCheckboxChange}
                  type="checkbox"
                  className="border-gray-400 mr-2 flex h-6 w-6 items-center justify-center rounded-md border"
                  checked={formValues.isDefault}
                />
                <label
                  htmlFor="set-address"
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
