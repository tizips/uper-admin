declare namespace APICommonSetting {

  type Props = {
    module: string;
  }

  type Data = {
    id?: string;
    type: string;
    label?: string;
    key?: string;
    val?: string;
    is_required?: number;
    created_at?: string;
  };

  type Preview = {
    visible?: boolean;
    title?: string;
    picture?: string;
  };
}
