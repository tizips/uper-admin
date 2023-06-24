declare namespace APIBlogCategory {
  type Props = {
    visible?: boolean;
    params?: APIBlogCategories.Data;
    onCreate?: () => void;
    onUpdate?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
  };

  type Editor = {
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
    text?: string;
  };

  type Former = {
    parent?: string;
    type?: 'parent' | 'page' | 'list';
    name?: string;
    pictures?: any[];
    title?: string;
    keyword?: string;
    description?: string;
    order?: number;
    is_comment?: number;
    is_enable?: number;
  };

  type Loading = {
    confirmed?: boolean;
    parents?: boolean;
    upload?: boolean;
    information?: boolean;
  };
}
