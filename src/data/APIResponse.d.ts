declare namespace APIResponse {

  export type Response<T> = {
    code: number;
    message: string;
    data: T;
  }

  export type Paginate<T> = {
    code: number;
    message: string;
    data: APIData.Paginate<T>;
  }
}
