declare namespace APIBlogLinks {

  type Data = {
    id?: number;
    name?: string;
    url?: string;
    logo?: string;
    position?: string;
    email?: string;
    order?: number;
    is_enable?: number;
    loading_deleted?: boolean;
    loading_enable?: boolean;
  };

  type Visible = {
    editor?: boolean;
  };

  type Search = {
    page?: number;
  }
}
