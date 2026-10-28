export interface ApiResponseEnvelope<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
  message?: string;
}

export function apiSuccess<T>(data: T, meta?: any, message?: string): ApiResponseEnvelope<T> {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {}),
    ...(message ? { message } : {}),
  };
}
