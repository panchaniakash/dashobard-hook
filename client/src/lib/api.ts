export interface ApiResponse<T> {
  data: T;
  cached?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status,
      response
    );
  }

  return response.json();
}

export const api = {
  getVertical: (bucketId: number, userId: number) =>
    makeRequest('/api/dashboard/getVertical', {
      method: 'POST',
      body: JSON.stringify({ bucketId, userId }),
    }),

  getBusiness: (bucketId: number, userId: number, vertical: string) =>
    makeRequest('/api/dashboard/getBusiness', {
      method: 'POST',
      body: JSON.stringify({ bucketId, userId, vertical }),
    }),

  getSite: (bucketId: number, userId: number, Business: string) =>
    makeRequest('/api/dashboard/getSite', {
      method: 'POST',
      body: JSON.stringify({ bucketId, userId, Business }),
    }),

  getYears: () =>
    makeRequest('/api/dashboard/getYearsFromSecAuto'),

  getMonths: (year: string) =>
    makeRequest('/api/dashboard/getMonthFromSecAuto', {
      method: 'POST',
      body: JSON.stringify({ year }),
    }),

  getMetrics: () =>
    makeRequest('/api/dashboard/metrics'),
};
