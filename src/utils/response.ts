// src/utils/response.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export const sendResponse = <T>(res: any, data: T, message = 'Success', status = 200): void => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(status).json(payload);
};

export const sendError = (res: any, message: string, status = 400): void => {
  const payload = { success: false, message };
  res.status(status).json(payload);
};