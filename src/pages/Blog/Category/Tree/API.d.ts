declare namespace APIBlogCategories {
  type Data = {
    id?: string;
    type?: 'parent' | 'page' | 'list';
    name?: string;
    order?: number;
    is_comment?: number;
    is_enable?: number;
    children?: Data[];
    loading_deleted?: boolean;
    loading_enable?: boolean;
  };

  type Visible = {
    editor?: boolean;
  };
}
