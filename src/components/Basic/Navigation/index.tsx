import {useEffect, useState} from 'react';
import {Menu} from 'antd';
import {useLocation, useModel, history} from "umi";
import {doBasicPermissions} from "@/services/basic";
import Constants from '@/utils/Constants';
import routes from '../../../../config/routes';

const Header = () => {

  const location = useLocation();

  const {initialState, setInitialState} = useModel('@@initialState');
  const [click, setClick] = useState(false);

  const toRoute = (items: any[], module: string, permissions: Record<string, string>) => {
    let temp: string = '';

    for (const item of items) {
      if (item?.routes) {
        temp = toRoute(item.routes, module, permissions);
        if (temp) return temp;
      } else if (item.path && item.path.startsWith(`/${module}`)) {
        for (const val in permissions) {
          if (!item.access && !item.permission || item?.access == 'route' && item?.permission == val) {
            return item.path;
          }
        }
      }
    }

    return temp;
  };

  const onClick = (event: any) => {

    setClick(true);

    const {key} = event;

    if (key != initialState?.module && initialState?.modules) {

      const index = initialState?.modules.findIndex(item => item.code == key);

      if (index >= 0) {
        setInitialState({...initialState, module: key});
      }
    }
  };

  useEffect(() => {
    if (initialState?.module && click) {
      doBasicPermissions(initialState?.module)
        .then(response => {
          if (response.code != Constants.Success || response.data.length <= 0) {
            history.push(Constants.Forbidden)
          } else {
            const permissions: Record<string, string> = {};
            if (response.data) {
              response.data.forEach((item) => permissions[item] = item);
            }
            setInitialState({...initialState, permissions})
          }
        });
    }
  }, [initialState?.module]);

  useEffect(() => {

    if (initialState?.module && !location.pathname.startsWith(`/${initialState.module}`)) {

      let route = '';

      if (initialState?.module && initialState?.permissions) {
        route = toRoute(routes, initialState.module, initialState.permissions)
      }

      if (route) {
        history.push({pathname: route})
      }
    }
  }, [location, initialState?.module, initialState?.permissions])

  return (
    initialState?.modules ?
      <Menu
        mode="horizontal"
        selectedKeys={[`${initialState?.module}`]}
        onClick={onClick}
        theme='light'
        items={initialState?.modules?.map((item) => ({key: item.code, label: item.name}))}
      /> : <></>
  )
};

export default Header;
