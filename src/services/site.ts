import {request} from 'umi';

export async function doSitePermissions() {
  return request<APIResponse.Response<APISite.doSitePermissions[]>>('/api-admin/site/permissions');
}

export async function doSiteRoleByOpening() {
  return request<APIResponse.Response<APISite.doSiteRoleByOpening[]>>('/api-admin/site/role/opening');
}

export async function doSiteRoleOfInformation(id?: number) {
  return request<APIResponse.Response<APISite.doSiteRoleOfInformation>>(`/api-admin/site/roles/${id}`);
}
