import React, {useEffect, useState} from 'react';
import {useModel} from "umi";
import {Form, Input, InputNumber, Modal, notification, Select, Spin, Tabs, Upload} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import Constants from '@/utils/Constants';
import {doCreate, doUpdate} from './service';

import styles from './index.less';

const Editor: React.FC<APIBlogLink.Props> = (props) => {

  const {initialState} = useModel('@@initialState');

  const [former] = Form.useForm<APIBlogLink.Former>();

  const [loading, setLoading] = useState<APIBlogLink.Loading>({});
  const [tab, setTab] = useState('basic');

  const logos = Form.useWatch('logos', former);

  const onUpload = (e: any) => {
    if (Array.isArray(e)) return e;

    if (e.file.status == 'uploading' && e.file.percent == 0) {
      setLoading({...loading, upload: true});
    } else if (e.file.status == 'done') {
      setLoading({...loading, upload: false});

      const {uid, response}: { uid: string; response: APIResponse.Response<APIBasic.Upload> } =
        e.file;

      if (response.code !== Constants.Success) {
        notification.error({message: response.message});
      } else {
        e.fileList?.forEach((item: any) => {
          if (item.uid == uid) item.thumbUrl = response.data.url;
        });
      }
    }

    return e && e.fileList;
  };

  const toCreate = (params: any) => {
    setLoading({...loading, confirmed: true});
    doCreate(params)
      .then((response: APIResponse.Response<any>) => {
        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          notification.success({message: '添加成功'});

          if (props.onCreate) props.onCreate();
          if (props.onSave) props.onSave();
        }
      })
      .finally(() => setLoading({...loading, confirmed: false}));
  };

  const toUpdate = (params: any) => {
    setLoading({...loading, confirmed: true});
    doUpdate(props.params?.id, params)
      .then((response: APIResponse.Response<any>) => {
        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          notification.success({message: '修改成功'});
          if (props.onUpdate) props.onUpdate();
          if (props.onSave) props.onSave();
        }
      })
      .finally(() => setLoading({...loading, confirmed: false}));
  };

  const onSubmit = (values: APIBlogLink.Former) => {
    const params: APIBlogLink.Editor = {
      name: values.name,
      url: values.url,
      position: values.position,
      email: values.email,
      order: values.order,
      is_enable: values.is_enable,
    };

    if (values.logos && values.logos.length > 0) {
      params.logo = values.logos[0].thumbUrl;
    }

    if (props.params) toUpdate(params);
    else toCreate(params);
  };

  const toInitByUpdate = () => {

    former.setFieldsValue({
      name: props.params?.name,
      url: props.params?.url,
      position: props.params?.position,
      email: props.params?.email,
      order: props.params?.order,
      is_enable: props.params?.is_enable,
    });

    if (props.params?.logo) {
      former.setFieldValue('logos', [props.params.logo]);
    }
  };

  const toInit = () => {

    setTab('basic');

    if (props.params) {
      toInitByUpdate();
    } else {
      former.setFieldsValue({
        name: undefined,
        url: undefined,
        position: 'bottom',
        email: undefined,
        logos: undefined,
        order: 50,
        is_enable: 1,
      });
    }
  };

  useEffect(() => {
    if (props.visible) {
      toInit();
    }
  }, [props.visible]);

  return (
    <>
      <Modal
        open={props.visible}
        closable={false}
        centered
        maskClosable={false}
        onOk={former.submit}
        onCancel={props.onCancel}
        confirmLoading={loading.confirmed}
      >
        <Spin spinning={!!loading.information} tip="数据加载中...">
          <Form form={former} onFinish={onSubmit} labelCol={{span: 3}}>
            <Tabs
              activeKey={tab}
              onChange={(activeKey) => setTab(activeKey)}
              items={[
                {
                  key: 'basic',
                  label: '基本',
                  forceRender: true,
                  children: (
                    <>
                      <Form.Item
                        label="名称"
                        name="name"
                        rules={[{required: true}, {max: 20}]}
                      >
                        <Input/>
                      </Form.Item>
                      <Form.Item
                        label="链接"
                        name="url"
                        rules={[{required: true, max: 64}, {type: 'url'}]}
                      >
                        <Input/>
                      </Form.Item>
                      <Form.Item
                        label="邮箱"
                        name="email"
                        rules={[{max: 64}, {type: 'email'}]}
                      >
                        <Input/>
                      </Form.Item>
                      <Form.Item label="启用" name="is_enable" rules={[{required: true}]}>
                        <Select>
                          <Select.Option value={1}>是</Select.Option>
                          <Select.Option value={2}>否</Select.Option>
                        </Select>
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'other',
                  label: '其他',
                  forceRender: true,
                  children: (
                    <>
                      <Form.Item
                        label="LOGO"
                        name="logos"
                        valuePropName="fileList"
                        getValueFromEvent={onUpload}
                      >
                        <Upload
                          name="file"
                          listType="picture-card"
                          showUploadList={false}
                          maxCount={1}
                          className={styles.upload}
                          action={Constants.Upload}
                          headers={{
                            Authorization: localStorage.getItem(Constants.Authorization) as string,
                          }}
                          data={{dir: '/link/logo'}}
                        >
                          <Spin spinning={!!loading.upload} tip="Loading...">
                            {logos && logos.length > 0 ? (
                              <img
                                src={logos[0].thumbUrl}
                                alt="logo"
                                style={{width: '100%'}}
                              />
                            ) : (
                              <div className="upload-area">
                                <UploadOutlined
                                  style={{color: initialState?.settings?.colorPrimary, fontSize: '36px'}}/>
                              </div>
                            )}
                          </Spin>
                        </Upload>
                      </Form.Item>
                      <Form.Item label="位置" name="position" rules={[{required: true}]}>
                        <Select>
                          <Select.Option value='all'>全部</Select.Option>
                          <Select.Option value='bottom'>底部</Select.Option>
                          <Select.Option value='other'>其他</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        label="排序"
                        name="order"
                        rules={[{required: true}, {type: 'number'}]}
                      >
                        <InputNumber min={1} max={99} controls={false} style={{width: '100%'}}/>
                      </Form.Item>
                    </>
                  ),
                },
              ]}
            />
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default Editor;
