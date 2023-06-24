declare namespace APIData {

  type Paginate<T> = {
    size: number;
    page: number;
    total: number;
    data?: T[];
  }

  type Enable<T> = {
    id?: T;
    name?: string;
  }

}
