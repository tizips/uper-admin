declare namespace APISiteArticle {
  type Props = {
    visible?: boolean;
    params?: APIBlogArticles.Data;
    onCreate?: () => void;
    onUpdate?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
  };

  type Editor = {
    category?: string;
    name?: string;
    picture?: string;
    title?: string;
    keyword?: string;
    description?: string;
    source?: string;
    url?: string;
    is_comment?: number;
    is_enable?: number;
    content?: string;
    text?: string;
  };

  type Former = {
    category?: string[];
    name?: string;
    pictures?: any[];
    title?: string;
    keyword?: string;
    description?: string;
    source?: string;
    url?: string;
    is_comment?: number;
    is_enable?: number;
  };

  type Loading = {
    confirmed?: boolean;
    category?: boolean;
    upload?: boolean;
    information?: boolean;
  };
}
