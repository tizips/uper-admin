import { request } from 'umi';

export async function doPaginate(params?: any) {
  return request<APIResponse.Response<any>>('/api-admin/blog/articles', { params });
}

export async function doDelete(id?: string) {
  return request<APIResponse.Response<any>>(`/api-admin/blog/articles/${id}`, { method: 'DELETE' });
}

export async function doEnable(data: APIRequest.Enable<string>) {
  return request<APIResponse.Response<any>>('/api-admin/blog/article/enable', {
    method: 'PUT',
    data: data,
  });
}
