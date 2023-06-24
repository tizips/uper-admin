declare namespace APIAmap {

  type Props = {
    visible?: boolean;
    onSuccess?: (lat: number, lng: number) => void;
    onCancel?: () => void;
    latitude?: number;
    longitude?: number;
  }

}
