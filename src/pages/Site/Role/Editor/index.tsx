import React, {useEffect, useState} from 'react';
import {Button, Divider, Form, Input, Modal, notification, Space, Spin, TreeSelect} from 'antd';
import {doSitePermissions, doSiteRoleOfInformation} from "@/services/site";
import {doCreate, doUpdate} from './service';
import Constants from '@/utils/Constants';
import {RedoOutlined} from "@ant-design/icons";

const Editor = (props: APISiteRole.Props) => {

  const [former] = Form.useForm<APISiteRole.Former>();

  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<APISiteRole.Loading>({});

  const toPermissions = () => {

    setLoading({...loading, permission: true});

    doSitePermissions()
      .then(response => {
        if (response.code === Constants.Success) {
          setPermissions(response.data);
        }
      })
      .finally(() => {

        setLoading({...loading, permission: false})
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
          props.onCreate?.();
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
          props.onUpdate?.();
        }
      })
      .finally(() => {

        setLoading({...loading, confirmed: false})
      });
  };

  const onSubmit = (values: APISiteRole.Former) => {

    const params: APISiteRole.Editor = {
      name: values.name,
      permissions: values.permissions,
      summary: values.summary,
    };

    if (props.params) {
      toUpdate(params);
    } else {
      toCreate(params);
    }
  };

  const initCreate = () => {
    former.setFieldsValue({
      name: '',
      summary: '',
      permissions: [],
    });
  }

  const initUpdate = () => {

    setLoading({...loading, init: true})

    doSiteRoleOfInformation(props.params?.id)
      .then(response => {
        if (response.code != Constants.Success) {
          notification.error({message: response.message});
          props.onCancel?.()
        } else {
          former.setFieldsValue({
            name: response.data.name,
            permissions: response.data.permissions,
            summary: response.data.summary,
          })
        }
      })
      .finally(() => {
        setLoading({...loading, init: false})
      })
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
      if (permissions?.length <= 0) {
        toPermissions();
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
      <Spin spinning={!!loading.init}>
        <Form form={former} onFinish={onSubmit} labelCol={{span: 3}}>
          <Form.Item label="名称" name="name" rules={[{required: true}, {max: 20}]}>
            <Input/>
          </Form.Item>
          <Form.Item label="权限" required>
            <Space.Compact block>
              <Form.Item label='权限' name="permissions" rules={[{required: true}]} noStyle>
                <TreeSelect
                  showSearch={false}
                  treeData={permissions}
                  fieldNames={{label: 'name', value: 'code'}}
                  treeCheckable
                  maxTagCount={2}
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                />
              </Form.Item>
              <Button type='primary'
                      onClick={() => toPermissions()}
                      loading={loading.permission}
                      icon={<RedoOutlined/>}/>
            </Space.Compact>
          </Form.Item>
          <Form.Item label="简介" name="summary" rules={[{max: 255}]}>
            <Input.TextArea rows={2} maxLength={255} showCount/>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default Editor;
