export interface LoginValues {
  email: string;
  password: string;
}

export interface SignupValues {
  username: string;
  email: string;
  password: string;
  confirm: string;
}

export interface ProfileResponse {
  userId: number;
  username: string;
}
