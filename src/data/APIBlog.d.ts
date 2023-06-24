declare namespace APIBlog {

  type Category = {
    id?: string;
    parent?: string;
    type?: 'parent' | 'page' | 'list';
    name?: string;
    picture?: string;
    title?: string;
    keyword?: string;
    description?: string;
    order?: number;
    is_comment?: number;
    is_enable?: number;
    content?: string;
  };

  type Article<T> = {
    id?: string;
    category?: T;
    name?: string;
    picture?: string;
    title?: string;
    keyword?: string;
    description?: string;
    source?: string;
    url?: string;
    order?: number;
    is_comment?: number;
    is_enable?: number;
    content?: string;
  };
}
