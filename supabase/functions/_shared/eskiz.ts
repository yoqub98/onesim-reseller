/**
 * Eskiz.uz SMS Gateway Integration
 * Base URL: https://notify.eskiz.uz
 */

const ESKIZ_BASE_URL = 'https://notify.eskiz.uz';

interface EskizAuthResponse {
  message: string;
  data: {
    token: string;
  };
  token_type: string;
}

interface EskizSendResponse {
  id: string;
  message: string;
  status: string;
}

interface EskizBatchMessage {
  user_sms_id: string; // your idempotency key per message
  to: string;          // phone as integer string, e.g. "998901234567"
  text: string;
}

interface EskizBatchResponse {
  id: number;          // dispatch_id assigned by Eskiz
  message: string;
  status: string;
  messages?: Array<{ id: number; user_sms_id: string; status: string }>;
}

interface EskizBalanceResponse {
  data: {
    balance: number;
  };
  status: string;
}

export class EskizClient {
  private token: string | null = null;
  private email: string;
  private secretKey: string;

  constructor() {
    this.email = Deno.env.get('ESKIZ_EMAIL') ?? '';
    this.secretKey = Deno.env.get('ESKIZ_SECRET_KEY') ?? '';
  }

  /**
   * Login and get bearer token (TTL: 30 days)
   */
  async login(): Promise<string> {
    const formData = new FormData();
    formData.append('email', this.email);
    formData.append('password', this.secretKey);

    const response = await fetch(`${ESKIZ_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Eskiz login failed: ${response.status}`);
    }

    const data: EskizAuthResponse = await response.json();
    this.token = data.data.token;
    return this.token;
  }

  /**
   * Check SMS balance
   */
  async getBalance(): Promise<number> {
    if (!this.token) {
      await this.login();
    }

    const response = await fetch(`${ESKIZ_BASE_URL}/api/user/get-limit`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Eskiz balance check failed: ${response.status}`);
    }

    const data: EskizBalanceResponse = await response.json();
    return data.data.balance;
  }

  /**
   * Send single SMS
   *
   * FREE TIER NOTE: Only "Bu Eskiz dan test" message is allowed with from="4546"
   * Production message template is commented out and ready to swap.
   */
  async sendSms(
    phone: string,
    message: string,
    callbackUrl?: string
  ): Promise<EskizSendResponse> {
    if (!this.token) {
      await this.login();
    }

    const formData = new FormData();
    formData.append('mobile_phone', phone);
    formData.append('message', message);
    formData.append('from', '4546');
    if (callbackUrl) {
      formData.append('callback_url', callbackUrl);
    }

    const response = await fetch(`${ESKIZ_BASE_URL}/api/message/sms/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Eskiz send failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Send batch SMS (production use — requires paid Eskiz tier)
   *
   * FREE TIER NOTE: Batch endpoint requires a paid Eskiz plan.
   * Use sendSms() with sequential calls for free tier.
   *
   * @param messages - Array of { user_sms_id, to, text } per recipient
   * @param dispatchId - Your numeric batch ID for tracking
   * @param callbackUrl - Optional DLR callback URL
   */
  async sendSmsBatch(
    messages: EskizBatchMessage[],
    dispatchId: number,
    callbackUrl?: string
  ): Promise<EskizBatchResponse> {
    if (!this.token) {
      await this.login();
    }

    const body: Record<string, unknown> = {
      messages,
      from: '4546',
      dispatch_id: dispatchId,
    };

    if (callbackUrl) {
      body.callback_url = callbackUrl;
    }

    const response = await fetch(`${ESKIZ_BASE_URL}/api/message/sms/send-batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Eskiz batch send failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Build SMS message for eSIM delivery
   *
   * @param companyName - Partner company name
   * @param country - Destination country
   * @param dataGb - Data amount in GB
   * @param token - Short URL token
   * @param useTestMessage - If true, use free tier test message
   */
  static buildSmsMessage(
    companyName: string,
    country: string,
    dataGb: number,
    token: string,
    useTestMessage = true
  ): string {
    if (useTestMessage) {
      // FREE TIER: Only this message is allowed
      return 'Bu Eskiz dan test';
    }

    // PRODUCTION MESSAGE (uncomment when upgraded):
    // return `${companyName}: eSIM tayyor! ${country} ${dataGb}GB. O'rnatish: onesim.uz/e/${token}`;
    return `${companyName}: eSIM tayyor! ${country} ${dataGb}GB. O'rnatish: onesim.uz/e/${token}`;
  }
}

/**
 * Map Eskiz delivery status to our internal status
 */
export function mapEskizStatus(eskizStatus: string): {
  status: string;
  failureReason?: string;
} {
  switch (eskizStatus) {
    case 'DELIVRD':
      return { status: 'delivered' };
    case 'UNDELIV':
    case 'UNDELIVERABLE':
      return { status: 'failed', failureReason: 'undeliverable' };
    case 'REJECTD':
      return { status: 'failed', failureReason: 'rejected_blacklist' };
    case 'DELETED':
      return { status: 'failed', failureReason: 'invalid_sender' };
    case 'EXPIRED':
      return { status: 'failed', failureReason: 'sms_expired' };
    case 'ACCEPTED':
    case 'ENROUTE':
      return { status: 'sent' };
    default:
      return { status: 'unknown' };
  }
}
