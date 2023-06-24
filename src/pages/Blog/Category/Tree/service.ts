import { request } from 'umi';

export async function doTree(params?: any) {
  return request<APIResponse.Response<any>>('/api-admin/blog/categories', { params });
}

export async function doDelete(id?: string) {
  return request<APIResponse.Response<any>>(`/api-admin/blog/categories/${id}`, {
    method: 'DELETE',
  });
}

export async function doEnable(data: APIData.Enable<string>) {
  return request<APIResponse.Response<any>>('/api-admin/blog/category/enable', {
    method: 'PUT',
    data: data,
  });
}
