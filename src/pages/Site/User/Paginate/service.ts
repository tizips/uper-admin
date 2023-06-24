import {request} from 'umi';

export async function doPaginate(params?: any) {
  return request<APIResponse.Paginate<APISiteUsers.Data>>('/api-admin/site/users', {params});
}

export async function doDelete(id?: number) {
  return request<APIResponse.Response<any>>(`/api-admin/site/users/${id}`, {method: 'DELETE'});
}

export async function doEnable(data: APIRequest.Enable<number>) {
  return request<APIResponse.Response<any>>('/api-admin/site/user/enable', {
    method: 'PUT',
    data: data,
  });
}
