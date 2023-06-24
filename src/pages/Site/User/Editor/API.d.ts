declare namespace APISiteAdmin {

  type Props = {
    visible?: boolean;
    params?: APISiteUsers.Data;
    onCreate?: () => void;
    onUpdate?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
  };

  type Editor = {
    nickname?: string;
    username?: string;
    mobile?: string;
    email?: string;
    password?: string;
    roles?: number[];
    is_enable?: number;
  };

  type Former = {
    nickname?: string;
    username?: string;
    email?: string;
    mobile?: string;
    password?: string;
    roles?: number[];
    is_enable?: number;
  };

  type Loading = {
    confirmed?: boolean;
    roles?: boolean;
  };

}
