import { request } from 'umi';

export async function doCreate(params?: any) {
  return request<APIResponse.Response<any>>('/api-admin/blog/article', {
    method: 'POST',
    data: params,
  });
}

export async function doUpdate(id?: string, params?: any) {
  return request<APIResponse.Response<any>>(`/api-admin/blog/articles/${id}`, {
    method: 'PUT',
    data: params,
  });
}
