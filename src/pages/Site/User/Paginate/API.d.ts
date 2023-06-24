declare namespace APISiteUsers {

  type Data = {
    id?: number;
    nickname?: string;
    username?: string;
    email?: string;
    mobile?: string;
    is_enable?: number;
    roles?: { id: number; name: string }[];
    created_at?: string;
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
