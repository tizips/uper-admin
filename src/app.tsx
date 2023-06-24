import React from 'react';
import {Settings as LayoutSettings} from '@ant-design/pro-components';
import {history, RunTimeLayoutConfig} from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import {errorConfig} from './requestErrorConfig';
import {RequestOptionsInit} from "umi-request";
import Navigation from "@/components/Basic/Navigation";
import RightContent from '@/components/Basic/RightContent';
import Footer from '@/components/Basic/Footer';
import {doBasicAccount, doBasicModules, doBasicPermissions} from "@/services/basic";
import Constants from '@/utils/Constants';
import 'dayjs/locale/zh-cn';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  module?: string;
  modules?: APIBasic.doBasicModules[],
  account?: APIBasic.doBasicAccount;
  permissions?: Record<string, string>;
  toAccount?: () => Promise<APIBasic.doBasicAccount | undefined>;
  settings?: Partial<LayoutSettings>;
}> {

  const toAccount = async () => {
    try {
      const response = await doBasicAccount();
      if (response.code == Constants.Success) return response.data;
    } catch (error) {
      history.push(Constants.Login);
    }
    return undefined;
  };


  const pathname = history.location.pathname.slice(Constants.Prefix.length)

  // 如果不是登录页面，执行

  if (pathname !== Constants.Login) {

    const account = await toAccount();

    if (!account) {
      history.push(Constants.Forbidden)
    } else {

      const modules = await doBasicModules();

      if (modules.code != Constants.Success || modules.data.length <= 0) {
        history.push(Constants.Forbidden)
      } else {

        const paths = pathname.split('/');

        let slug = modules.data[0].code;

        if (paths.length >= 2) {
          modules.data.forEach(item => {
            if (item.code === paths[1]) {
              slug = item.code;
            }
          });
        }

        if (slug == '') {
          slug = modules.data[0].code
        }

        const permissions = await doBasicPermissions(slug);

        if (permissions.code != Constants.Success || permissions.data.length <= 0) {
          history.push(Constants.Forbidden)
        } else {

          const permission: Record<string, string> = {};

          if (permissions.data) {
            permissions.data.forEach(item => permission[item] = item);
          }

          return {
            toAccount,
            module: slug,
            modules: modules.data,
            account,
            permissions: permission,
            settings: defaultSettings
          };
        }
      }
    }

    return {toAccount, account, settings: defaultSettings};
  }

  return {
    toAccount,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({initialState, setInitialState}) => {
  return {
    logo: false,
    headerContentRender: () => initialState?.account && <Navigation/>,
    rightContentRender: () => <RightContent/>,
    footerRender: () => <Footer/>,
    onPageChange: () => {
      const {location} = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.account && location.pathname !== Constants.Login) {
        history.push(Constants.Login);
      }
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};

const AuthHeaderInterceptor = (url: string, options: RequestOptionsInit) => {

  const Authorization = localStorage.getItem(Constants.Authorization);

  let headers = {};

  if (Authorization && Authorization !== '') {
    headers = {Authorization: Authorization};
  }

  return {
    url: `${url}`,
    options: {...options, interceptors: true, headers},
  };
};

const RefreshResponse = (response: any, options: RequestOptionsInit) => {

  let token = ''

  try {
    token = response.headers.get(Constants.Authorization)
  } catch (e) {
    token = response.headers[Constants.Authorization.toLowerCase()];
  }

  if (token && token != localStorage.getItem(Constants.Authorization)) {
    localStorage.setItem(Constants.Authorization, token);
  }

  return response;
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
  requestInterceptors: [AuthHeaderInterceptor],
  responseInterceptors: [RefreshResponse],
};
