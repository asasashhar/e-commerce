/**
 * useGooglePay — wraps the Google Pay API for a demo integration.
 * Handles button rendering, payment sheet display, and result callbacks.
 *
 * In production replace MERCHANT_ID and MERCHANT_NAME with your real values
 * from the Google Pay & Wallet Console (https://pay.google.com/business/console).
 */

declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (config: object) => GooglePayClient;
        };
      };
    };
  }
}

interface GooglePayClient {
  isReadyToPay(req: object): Promise<{ result: boolean }>;
  loadPaymentData(req: object): Promise<{ paymentMethodData: { description: string } }>;
}

const GOOGLE_PAY_ENV: 'TEST' | 'PRODUCTION' = 'TEST';
const MERCHANT_ID = 'BCR2DN4TRUQE4LZY'; // Replace with your real merchant ID
const MERCHANT_NAME = 'STRIDE Store';
const GATEWAY = 'example'; // Replace with your payment gateway (stripe, square, etc.)
const GATEWAY_MERCHANT_ID = 'exampleGatewayMerchantId';

const BASE_REQUEST = {
  apiVersion: 2,
  apiVersionMinor: 0,
};

const ALLOWED_PAYMENT_METHODS = [
  {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
      allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA'],
    },
    tokenizationSpecification: {
      type: 'PAYMENT_GATEWAY',
      parameters: { gateway: GATEWAY, gatewayMerchantId: GATEWAY_MERCHANT_ID },
    },
  },
];

function getClient(): GooglePayClient | null {
  if (typeof window !== 'undefined' && window.google?.payments?.api?.PaymentsClient) {
    return new window.google.payments.api.PaymentsClient({ environment: GOOGLE_PAY_ENV });
  }
  return null;
}

export async function checkGooglePayReady(): Promise<boolean> {
  const client = getClient();
  if (!client) return false;
  try {
    const res = await client.isReadyToPay({ ...BASE_REQUEST, allowedPaymentMethods: ALLOWED_PAYMENT_METHODS });
    return res.result;
  } catch {
    return false;
  }
}

export async function requestGooglePayment(totalAmount: string, currency: string = 'USD'): Promise<
  { success: true; description: string } | { success: false; error: string }
> {
  const client = getClient();
  if (!client) return { success: false, error: 'Google Pay not available' };

  const paymentDataRequest = {
    ...BASE_REQUEST,
    allowedPaymentMethods: ALLOWED_PAYMENT_METHODS,
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: totalAmount,
      currencyCode: currency,
      countryCode: 'US',
    },
    merchantInfo: {
      merchantId: MERCHANT_ID,
      merchantName: MERCHANT_NAME,
    },
  };

  try {
    const data = await client.loadPaymentData(paymentDataRequest);
    return { success: true, description: data.paymentMethodData.description };
  } catch (err: unknown) {
    const e = err as { statusCode?: string };
    if (e?.statusCode === 'CANCELED') {
      return { success: false, error: 'Payment cancelled.' };
    }
    return { success: false, error: 'Google Pay payment failed.' };
  }
}
