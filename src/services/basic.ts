import {request} from "@umijs/max";

export async function doBasicAccount() {
  return request<APIResponse.Response<APIBasic.doBasicAccount>>('/api-admin/basic/account/information');
}

/** 退出登录接口 POST /api/logout */
export async function doBasicLogout() {
  return request<APIResponse.Response<any>>('/api-admin/basic/account/logout', {
    method: 'POST',
  });
}

export async function doBasicModules() {
  return request<APIResponse.Response<APIBasic.doBasicModules[]>>('/api-admin/basic/account/modules');
}

export async function doBasicPermissions(module: string) {
  return request<APIResponse.Response<string[]>>('/api-admin/basic/account/permissions', {
    params: {module},
  });
}
