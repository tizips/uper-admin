import React from 'react';
import {useLocation} from "umi";
import {history, useModel} from '@umijs/max';
import type {MenuInfo} from 'rc-menu/lib/interface';
import {Avatar, Modal, notification, Spin} from 'antd';
import {LogoutOutlined, UserOutlined} from '@ant-design/icons';
import {useEmotionCss} from '@ant-design/use-emotion-css';
import {setAlpha} from '@ant-design/pro-components';
import {stringify} from 'querystring';
import HeaderDropdown from '@/components/Basic/HeaderDropdown';
import {doBasicLogout} from '@/services/basic';
import Constants from '@/utils/Constants';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

const Name = () => {
  const {initialState} = useModel('@@initialState');
  const {account} = initialState || {};

  const nameClassName = useEmotionCss(({token}) => {
    return {
      width: '70px',
      height: '48px',
      overflow: 'hidden',
      lineHeight: '48px',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      [`@media only screen and (max-width: ${token.screenMD}px)`]: {
        display: 'none',
      },
    };
  });

  return <span className={`${nameClassName} anticon`}>{account?.nickname}</span>;
};

const AvatarLogo = () => {
  const {initialState} = useModel('@@initialState');
  const {account} = initialState || {};

  const avatarClassName = useEmotionCss(({token}) => {
    return {
      marginRight: '8px',
      color: token.colorPrimary,
      verticalAlign: 'top',
      background: setAlpha(token.colorBgContainer, 0.85),
      [`@media only screen and (max-width: ${token.screenMD}px)`]: {
        margin: 0,
      },
    };
  });

  return <Avatar size="small" className={avatarClassName} src={account?.avatar} alt="avatar"/>;
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({menu}) => {

  const location = useLocation();

  const toLogout = async () => {
    doBasicLogout()
      .then((response: APIResponse.Response<any>) => {
        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          setInitialState((s) => ({
            ...s,
            account: undefined,
            key: undefined,
            modules: undefined,
            permissions: undefined
          }));

          localStorage.clear();

          if (location.pathname !== Constants.Login) {
            history.replace({
              pathname: '/login',
              search: stringify({
                redirect: location.pathname,
              }),
            });
          }
        }
      });
  };

  const onLogout = () => {
    Modal.confirm({
      title: '登出',
      content: '确定要退出该账号吗？',
      centered: true,
      onOk: toLogout,
    });
  };

  const actionClassName = useEmotionCss(({token}) => {
    return {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  const {initialState, setInitialState} = useModel('@@initialState');

  const onMenu = (event: MenuInfo) => {
    const {key} = event;
    if (key === 'logout') {
      onLogout();
    } else {
      history.push(`/${key}`);
    }
  };

  const loading = (
    <span className={actionClassName}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const {account} = initialState;

  if (!account || !account.nickname) {
    return loading;
  }

  const menuItems = [
    ...(!!account
      ? [
        {
          type: 'divider' as const,
        },
        {
          key: 'profile',
          icon: <UserOutlined/>,
          label: '个人中心',
        },
        {
          type: 'divider' as const,
        },
      ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined/>,
      label: '退出登录',
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenu,
        items: menuItems,
      }}
    >
      <span className={actionClassName}>
        <AvatarLogo/>
        <Name/>
      </span>
    </HeaderDropdown>
  );
};

export default AvatarDropdown;
