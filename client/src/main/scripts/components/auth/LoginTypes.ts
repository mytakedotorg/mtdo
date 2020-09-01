export interface LoginReq {
  email: string;
  kind: string;
  redirect?: string;
}

export interface LoginRes {
  title: string;
  body: string;
  btn: string;
}
