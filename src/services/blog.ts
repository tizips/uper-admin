import { request } from 'umi';
export async function doBlogCategoryByOpening() {
  return request<APIResponse.Response<any>>('/api-admin/blog/category/opening');
}

export async function doBlogCategoryByParent() {
  return request<APIResponse.Response<any>>('/api-admin/blog/category/parent');
}
export async function doBlogCategoryByInformation(id?: string) {
  return request<APIResponse.Response<any>>(`/api-admin/blog/categories/${id}`);
}

export async function doBlogArticleByInformation(id?: string) {
  return request<APIResponse.Response<any>>(`/api-admin/blog/articles/${id}`);
}
