declare namespace APIBlogArticles {

  type Data = {
    id?: string;
    name?: string;
    category?: string;
    author?: string;
    is_enable?: number;
    created_at?: string;
    children?: Data[];
    loading_deleted?: boolean;
    loading_enable?: boolean;
  };

  type Visible = {
    editor?: boolean;
  };

  type Search = {
    page?: number;
  };
}
