export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type MeResponse = {
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  name?: string;
  password: string;
};

export type ApiValidationErrors = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

export type ApiError = {
  statusCode: number;
  message: string;
  code?: string;
  errors?: ApiValidationErrors;
};
