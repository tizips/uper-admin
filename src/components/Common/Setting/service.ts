import {request} from 'umi';

export async function doInformation(module: string) {
  return request<APIResponse.Response<any>>(`/api-admin/${module}/setting`);
}

export async function doSave(module: string, data?: any) {
  return request<APIResponse.Response<any>>(`/api-admin/${module}/setting`, {
    method: 'PUT',
    data: data,
  });
}
