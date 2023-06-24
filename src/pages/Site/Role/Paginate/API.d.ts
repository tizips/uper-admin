declare namespace APISiteRoles {

  type Data = {
    id?: number;
    name?: string;
    summary?: string;
    created_at?: string;
    loading_deleted?: boolean;
  };

  type Visible = {
    editor?: boolean;
  };

  type Search = {
    page?: number;
  };

}
