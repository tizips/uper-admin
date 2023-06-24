import {request} from 'umi';

export async function doPaginate(params?: any) {
  return request<APIResponse.Paginate<APISiteRoles.Data>>('/api-admin/site/roles', {params});
}

export async function doDelete(id?: number) {
  return request<APIResponse.Response<any>>(`/api-admin/site/roles/${id}`, {method: 'DELETE'});
}
