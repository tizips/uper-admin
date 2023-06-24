import {request} from 'umi';
import Constants from "@/utils/Constants";

export async function doUpload(file: any, dir?: string) {

  const data = new FormData();

  data.append('file', file);
  data.append('dir', dir || '/file');

  return request<APIResponse.Response<APIBasic.Upload>>(Constants.Upload, {method: 'POST', data, requestType: 'form'});
}
