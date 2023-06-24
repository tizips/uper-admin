import React, {useEffect, useState} from 'react';
import {useModel} from 'umi';
import {Button, Divider, Form, Input, Modal, notification, Select, Space, Tag} from 'antd';
import {RedoOutlined} from '@ant-design/icons';
import {doSiteRoleByOpening} from "@/services/site";
import {doCreate, doUpdate} from './service';
import Constants from '@/utils/Constants';
import Pattern from '@/utils/Pattern';

const Editor: React.FC<APISiteAdmin.Props> = (props) => {

  const {initialState} = useModel('@@initialState');

  const [former] = Form.useForm<APISiteAdmin.Former>();
  const [roles, setRoles] = useState<APISite.doSiteRoleByOpening[]>([]);
  const [loading, setLoading] = useState<APISiteAdmin.Loading>({});

  const toRoles = () => {

    setLoading({...loading, roles: true});

    doSiteRoleByOpening()
      .then(response => {
        if (response.code === Constants.Success) {
          setRoles(response.data);
        }
      })
      .finally(() => {
        setLoading({...loading, roles: false})
      });
  };

  const toCreate = (params: any) => {

    setLoading({...loading, confirmed: true});

    doCreate(params)
      .then(response => {

        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          notification.success({message: '添加成功'});

          props.onSave?.();
          props.onCreate?.()
        }
      })
      .finally(() => {

        setLoading({...loading, confirmed: false})
      });
  };

  const toUpdate = (params: any) => {

    setLoading({...loading, confirmed: true});

    doUpdate(props.params?.id, params)
      .then(response => {

        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          notification.success({message: '修改成功'});

          props.onSave?.();
          props.onUpdate?.()
        }
      })
      .finally(() => {

        setLoading({...loading, confirmed: false})
      });
  };

  const onSubmit = (values: APISiteAdmin.Former) => {

    const params: APISiteAdmin.Editor = {
      username: values.username,
      nickname: values.nickname,
      mobile: values.mobile,
      password: values.password,
      is_enable: values.is_enable,
      roles: values.roles,
    };

    if (props.params) {
      toUpdate(params);
    } else {
      toCreate(params);
    }
  };

  const initCreate = () => {

    former.setFieldsValue({
      username: undefined,
      nickname: undefined,
      mobile: undefined,
      password: undefined,
      is_enable: 1,
      roles: [],
    });
  }

  const initUpdate = () => {

    former.setFieldsValue({
      username: props.params?.username,
      nickname: props.params?.nickname,
      mobile: props.params?.mobile,
      email: props.params?.email,
      password: undefined,
      is_enable: props.params?.is_enable,
      roles: props.params?.roles?.map(item => item.id),
    });
  }

  const toInit = () => {

    if (props.params) {
      initUpdate()
    } else {
      initCreate()
    }
  };

  useEffect(() => {
    if (props.visible) {
      toInit();
      if (roles.length <= 0) {
        toRoles();
      }
    }
  }, [props.visible]);

  return (
    <Modal
      title={props.params ? '编辑' : '创建'}
      open={props.visible}
      centered
      onOk={former.submit}
      maskClosable={false}
      onCancel={props.onCancel}
      confirmLoading={loading.confirmed}
    >
      <Divider/>
      <Form form={former} onFinish={onSubmit} labelCol={{span: 3}}>
        <Form.Item label="昵称" name="nickname" rules={[{required: true}, {max: 32}]}>
          <Input/>
        </Form.Item>
        {!props.params && (
          <Form.Item
            label="账号"
            name="username"
            rules={[{required: true}, {pattern: RegExp(Pattern.ADMIN_USERNAME)}]}
          >
            <Input/>
          </Form.Item>
        )}
        <Form.Item label='其他'>
          <Space.Compact block>
            <Form.Item label="手机号" name="mobile" rules={[{max: 20}]} noStyle>
              <Input placeholder='手机号'/>
            </Form.Item>
            <Form.Item label="邮箱" name="email" rules={[{max: 64}, {type: "email"}]} noStyle>
              <Input placeholder='邮箱'/>
            </Form.Item>
          </Space.Compact>
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{required: !props.params}, {pattern: RegExp(Pattern.ADMIN_PASSWORD)}]}
        >
          <Input.Password placeholder="留空不修改"/>
        </Form.Item>
        <Form.Item label="角色" required>
          <Space.Compact block>
            <Form.Item label="角色" name="roles" rules={[{required: true}]} noStyle>
              <Select
                showSearch={false}
                mode="multiple"
                optionLabelProp="label"
                options={
                  roles.map(item => ({
                    label: <Tag color={initialState?.settings?.colorPrimary}>{item.name}</Tag>,
                    value: item.id,
                    children: item.name,
                  }))
                }
              />
            </Form.Item>
            <Button type='primary'
                    onClick={() => toRoles()}
                    loading={loading.roles}
                    icon={<RedoOutlined/>}/>
          </Space.Compact>
        </Form.Item>
        <Form.Item label="启用" name="is_enable" rules={[{required: true}]}>
          <Select
            options={[
              {label: '启用', value: 1},
              {label: '禁用', value: 2},
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Editor;
