import { request } from 'umi';

export async function doPaginate(params?: any) {
  return request<APIResponse.Response<any>>('/api-admin/blog/links', { params });
}

export async function doDelete(id?: number) {
  return request<APIResponse.Response<any>>(`/api-admin/blog/links/${id}`, {
    method: 'DELETE',
  });
}

export async function doEnable(data: APIRequest.Enable<number>) {
  return request<APIResponse.Response<any>>('/api-admin/blog/link/enable', {
    method: 'PUT',
    data: data,
  });
}
