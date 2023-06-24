import React, {useEffect, useState} from 'react';
import {useAccess} from "umi";
import {Button, Card, Form, Input, Modal, notification, Select, Spin, Upload} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import {doInformation, doSave} from './service';
import Constants from '@/utils/Constants';

const Setting = (props: APICommonSetting.Props) => {

  const access = useAccess();

  const [former] = Form.useForm();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState<APICommonSetting.Data[]>([]);
  const [change, setChange] = useState(false);
  const [pictures, setPictures] = useState<Record<string, any>>({});
  const [preview, setPreview] = useState<APICommonSetting.Preview>({});

  const onUpload = (e: any) => {
    if (Array.isArray(e)) return e;

    if (e.file.status == 'done') {

      const {uid, response}: { uid: string; response: APIResponse.Response<APIBasic.Upload> } = e.file;

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

  const toInformation = () => {

    setLoad(true);

    doInformation(props.module)
      .then((response: APIResponse.Response<APICommonSetting.Data[]>) => {
        if (response.code === Constants.Success) {
          setData(response.data);

          const temp: Record<string, any> = {};

          const children: any = {};

          response.data?.forEach((item) => {
            if (item.type == 'picture' && item.key) {
              children[item.key] = item.val ? [{key: item.key, thumbUrl: item.val}] : [];
              temp[item.key] = item.val;
            } else if (item.key) {
              children[item.key] = item.val;
            }
          });

          setPictures(temp);
          former.setFieldsValue(children);
        }
      })
      .finally(() => setLoad(false));
  };

  const onSave = (params: any) => {

    setLoad(true);

    doSave(props.module, params)
      .then((response: APIResponse.Response<any>) => {
        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          notification.success({message: '修改成功'});
          setChange(false);
          toInformation();
        }
      })
      .finally(() => setLoad(false));
  };

  const onSubmit = (values: Record<string, any>) => {

    const params: any = {};

    for (const key in values) {
      if (Array.isArray(values[key])) {
        params[key] = values[key].length > 0 ? values[key][0]?.thumbUrl : '';
      } else {
        params[key] = values[key];
      }
    }

    onSave(params);
  };

  const onChange = (value: any) => {
    for (const key in value) {

      if (Array.isArray(value[key])) {

        const temp: Record<string, any> = {...pictures};

        if (value[key].length > 0) {
          temp[key] = value[key][0]?.thumbUrl;
        } else {
          temp[key] = '';
        }

        setPictures(temp);
      }
    }

    setChange(true);
  };

  const onPreview = (file: any, label?: string) => {
    const {thumbUrl} = file;

    setPreview({visible: true, title: label, picture: thumbUrl});
  };

  useEffect(() => {
    toInformation();
  }, []);

  const RenderPicture = (record: APICommonSetting.Data) => (
    <Form.Item
      name={record.key}
      key={record.id}
      label={record.label}
      valuePropName="fileList"
      getValueFromEvent={onUpload}
      rules={[{required: record.is_required === 1}]}
    >
      <Upload
        name="file"
        listType="picture-card"
        maxCount={1}
        action={Constants.Upload}
        headers={{Authorization: localStorage.getItem(Constants.Authorization) as string}}
        data={{dir: `/${props.module}/setting`}}
        onPreview={(file) => onPreview(file, record.label)}
      >
        {record.key && !pictures[record.key] && (
          <div>
            <PlusOutlined/>
            <div style={{marginTop: 8}}>上传</div>
          </div>
        )}
      </Upload>
    </Form.Item>
  );

  const RenderInput = (record: APICommonSetting.Data) => (
    <Form.Item
      name={record.key}
      key={record.id}
      label={record.label}
      rules={[{required: record.is_required === 1}]}
    >
      <Input/>
    </Form.Item>
  );

  const RenderEmail = (record: APICommonSetting.Data) => (
    <Form.Item
      name={record.key}
      key={record.id}
      label={record.label}
      rules={[{required: record.is_required === 1, type: 'email'}]}
    >
      <Input/>
    </Form.Item>
  );

  const RenderURL = (record: APICommonSetting.Data) => (
    <Form.Item
      name={record.key}
      key={record.id}
      label={record.label}
      rules={[{required: record.is_required === 1, type: 'url'}]}
    >
      <Input/>
    </Form.Item>
  );

  const RenderEnable = (record: APICommonSetting.Data) => (
    <Form.Item
      name={record.key}
      key={record.id}
      label={record.label}
      rules={[{required: record.is_required === 1}]}
    >
      <Select
        options={[
          {label: '是', value: 1},
          {label: '否', value: 2},
        ]}
      />
    </Form.Item>
  );

  const RenderTextarea = (record: APICommonSetting.Data) => (
    <Form.Item
      name={record.key}
      key={record.id}
      label={record.label}
      rules={[{required: record.is_required === 1}]}
    >
      <Input.TextArea rows={3}/>
    </Form.Item>
  );

  const Render = (record: APICommonSetting.Data) => {
    let r = <React.Fragment key={record.key}/>;

    switch (record.type) {
      case 'picture':
        r = RenderPicture(record);
        break;
      case 'input':
        r = RenderInput(record);
        break;
      case 'email':
        r = RenderEmail(record);
        break;
      case 'url':
        r = RenderURL(record);
        break;
      case 'enable':
        r = RenderEnable(record);
        break;
      case 'textarea':
        r = RenderTextarea(record);
        break;
    }

    return r;
  };

  return (
    <>
      <Card title="设置">
        <Spin spinning={load}>
          <Form
            form={former}
            labelCol={{xs: {span: 24}, sm: {span: 3}, md: {span: 3}, lg: {span: 5}}}
            wrapperCol={{span: 24, lg: {span: 14}}}
            disabled={!access.page('blog.setting.update')}
            onFinish={onSubmit}
            onValuesChange={onChange}
          >
            {data?.map((item) => Render(item))}
            {change && (
              <Form.Item
                wrapperCol={{xs: {offset: 0, span: 24}, sm: {offset: 3}, md: {offset: 3}, lg: {offset: 5, span: 14}}}>
                <Button type="primary" htmlType="submit" loading={load} block>
                  修改
                </Button>
              </Form.Item>
            )}
          </Form>
        </Spin>
      </Card>
      <Modal
        open={preview.visible}
        title={preview.title}
        centered
        footer={null}
        onCancel={() => setPreview({visible: false})}
      >
        <img alt={preview.title} style={{width: '100%'}} src={preview.picture}/>
      </Modal>
    </>
  );
};

export default Setting;
