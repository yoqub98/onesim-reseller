/**
 * eSIMAccess API Integration
 * Base URL: https://api.esimaccess.com
 */

const ESIMACCESS_BASE_URL = 'https://api.esimaccess.com';

interface BalanceQueryResponse {
  success: boolean;
  errorCode: string;
  errorMsg: string | null;
  obj: {
    balance: number; // units × 10000 (e.g., 940000 = $94.00)
  };
}

interface OrderRequest {
  transactionId: string;
  packageInfoList: Array<{
    packageCode: string;
    count: number;
    price: number;
  }>;
}

interface OrderResponse {
  success: boolean;
  errorCode: string;
  errorMsg: string | null;
  obj: {
    orderNo: string;
  };
}

interface EsimProfile {
  iccid: string;
  ac: string; // LPA activation code
  qrCodeUrl: string;
  esimTranNo: string;
  shortUrl: string;
  esimStatus: string; // 'GETTING_RESOURCE' | 'GOT_RESOURCE'
  smdpStatus?: string;
  expiredTime?: string;
}

interface QueryResponse {
  success: boolean;
  errorCode: string;
  errorMsg: string | null;
  obj: {
    orderNo: string;
    esimList: EsimProfile[];
  };
}

export class EsimAccessClient {
  private accessCode: string;

  constructor() {
    this.accessCode = Deno.env.get('ESIMACCESS_ACCESS_CODE') ?? '';
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: unknown
  ): Promise<T> {
    const response = await fetch(`${ESIMACCESS_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessCode': this.accessCode,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`eSIMAccess API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Check account balance
   * @returns Balance in units × 10000 (940000 = $94.00)
   */
  async queryBalance(): Promise<number> {
    console.log('[eSIMAccess] Querying balance...');
    console.log('[eSIMAccess] Access code present:', !!this.accessCode);

    const response = await this.request<BalanceQueryResponse>(
      '/api/v1/open/balance/query',
      'POST',
      {}
    );

    console.log('[eSIMAccess] Balance response:', JSON.stringify(response));

    // Success when success=true and errorCode is null or '0'
    if (!response.success || (response.errorCode && response.errorCode !== '0')) {
      throw new Error(`Balance query failed: ${response.errorMsg || response.errorCode || 'Unknown error'}`);
    }

    return response.obj?.balance ?? 0;
  }

  /**
   * Place eSIM order
   * @param transactionId - Idempotency key (format: MODE-PARTNER_SHORT-TIMESTAMP)
   * @param packageCode - Package code from esim_packages
   * @param count - Number of eSIMs (1-30)
   * @param price - API price from esim_packages.api_price (units × 10000)
   */
  async orderEsim(
    transactionId: string,
    packageCode: string,
    count: number,
    price: number
  ): Promise<string> {
    const payload: OrderRequest = {
      transactionId,
      packageInfoList: [
        {
          packageCode,
          count,
          price,
        },
      ],
    };

    console.log('[eSIMAccess] Order payload:', JSON.stringify(payload));

    const response = await this.request<OrderResponse>(
      '/api/v1/open/esim/order',
      'POST',
      payload
    );

    console.log('[eSIMAccess] Order response:', JSON.stringify(response));

    // Success when success=true and errorCode is null or '0'
    if (!response.success || (response.errorCode && response.errorCode !== '0')) {
      throw new Error(`eSIM order failed: ${response.errorMsg || response.errorCode || 'Unknown error'}`);
    }

    return response.obj.orderNo;
  }

  /**
   * Query order status and get eSIM details
   * @param orderNo - Order number from orderEsim response
   */
  async queryOrder(orderNo: string): Promise<EsimProfile[]> {
    const response = await this.request<QueryResponse>(
      '/api/v1/open/esim/query',
      'POST',
      { orderNo }
    );

    // Success when success=true and errorCode is null or '0'
    if (!response.success || (response.errorCode && response.errorCode !== '0')) {
      throw new Error(`Order query failed: ${response.errorMsg || response.errorCode || 'Unknown error'}`);
    }

    return response.obj.esimList;
  }

  /**
   * Poll for eSIM allocation with retries
   * @param orderNo - Order number from orderEsim response
   * @param maxAttempts - Max polling attempts (default: 10)
   * @param intervalMs - Polling interval in ms (default: 3000)
   */
  async pollForAllocation(
    orderNo: string,
    maxAttempts = 10,
    intervalMs = 3000
  ): Promise<EsimProfile[]> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const esims = await this.queryOrder(orderNo);

      // Check if all eSIMs are allocated
      const allAllocated = esims.every(
        (esim) => esim.esimStatus === 'GOT_RESOURCE'
      );

      if (allAllocated) {
        return esims;
      }

      // Wait before next poll
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    // Return partial result after max attempts
    return await this.queryOrder(orderNo);
  }
}

/**
 * Generate idempotent transaction ID
 * Format: MODE-PARTNER_ID_SHORT-TIMESTAMP
 */
export function generateTransactionId(
  mode: 'AGENT' | 'CLIENT' | 'GROUP',
  partnerId: string
): string {
  const partnerShort = partnerId.substring(0, 8);
  const timestamp = Date.now();
  return `${mode}-${partnerShort}-${timestamp}`;
}
