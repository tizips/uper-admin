declare namespace APISiteRole {

  type Props = {
    visible?: boolean;
    params?: APISiteRoles.Data;
    onCreate?: () => void;
    onUpdate?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
  };

  type Editor = {
    name?: string;
    summary?: string;
    permissions?: string[];
  };

  type Former = {
    name?: string;
    summary?: string;
    permissions?: string[];
  };

  type Loading = {
    confirmed?: boolean;
    permission?: boolean;
    init?: boolean;
  };

}
