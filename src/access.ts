/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { permissions?: Record<string, string> }) {

  const {permissions} = initialState || {};

  return {
    route: (route: any): boolean => {

      const {permission} = route;

      return !permission || !!permissions && !!permissions[permission];
    },
    page: (permission: string): boolean => {

      return !!permission && !!permissions && !!permissions[permission];
    },
  };
}
