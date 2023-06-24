declare namespace APIBasicLogin {

  type Request = {
    username?: string;
    password?: string;
  }

  type Response = {
    expire_at?:number;
    token?:string;
  }

  type Former = {
    username?: string;
    password?: string;
  }

  type Result = {
    result?: "success" | "error";
    message?: string;
  }

}
