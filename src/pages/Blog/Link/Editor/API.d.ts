declare namespace APIBlogLink {

  type Props = {
    visible?: boolean;
    params?: APIBlogLinks.Data;
    onCreate?: () => void;
    onUpdate?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
  };

  type Editor = {
    name?: string;
    url?: string;
    logo?: string;
    position?: string;
    email?: string;
    order?: number;
    is_enable?: number;
  };

  type Former = {
    name?: string;
    url?: string;
    logos?: any[];
    position?: string;
    email?: string;
    order?: number;
    is_enable?: number;
  };

  type Loading = {
    confirmed?: boolean;
    upload?: boolean;
    information?: boolean;
  };
}
