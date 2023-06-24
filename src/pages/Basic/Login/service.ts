import {request} from "@umijs/max";

export async function doLogin(data: APIBasicLogin.Request) {
  return request<APIResponse.Response<APIBasicLogin.Response>>('/api-admin/basic/login/account', {
    method: 'POST',
    data: data,
  });
}
