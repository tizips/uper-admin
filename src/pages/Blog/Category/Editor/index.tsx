import React, {useEffect, useState} from 'react';
import {Form, Input, InputNumber, Modal, notification, Select, Spin, Tabs, Upload} from 'antd';
import {InboxOutlined, LoadingOutlined} from '@ant-design/icons';
import {IDomEditor, IEditorConfig, IToolbarConfig} from '@wangeditor/editor';
import {Editor as RichText, Toolbar} from '@wangeditor/editor-for-react';
import {doBlogCategoryByInformation, doBlogCategoryByParent} from '@/services/blog';
import {doUpload} from '@/services/helper';
import {doCreate, doUpdate} from './service';
import Constants from '@/utils/Constants';

import styles from './index.less';

const Editor: React.FC<APIBlogCategory.Props> = (props) => {

  const [former] = Form.useForm<APIBlogCategory.Former>();
  const [rich, setRich] = useState<IDomEditor | null>(null); // TS 语法

  const [notify, context] = notification.useNotification();

  const [information, setInformation] = useState<APIBlog.Category>();
  const [parents, setParents] = useState<APIData.Enable<string>[]>([]);
  const [loading, setLoading] = useState<APIBlogCategory.Loading>({});
  const [tab, setTab] = useState('basic');

  const type = Form.useWatch('type', former);
  const pictures = Form.useWatch('pictures', former);

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

        e.fileList?.forEach((item: any) => {
          if (item.uid == uid) {
            item.status = 'error';
          }
        });
      } else {

        e.fileList?.forEach((item: any) => {
          if (item.uid == uid) {
            item.url = response.data.url;
          }
        });
      }
    }

    return e && e.fileList;
  };

  const toParent = () => {
    setLoading({...loading, parents: true});
    doBlogCategoryByParent()
      .then((response: APIResponse.Response<APIData.Enable<string>[]>) => {
        if (response.code === Constants.Success) {
          setParents(response.data);
        }
      })
      .finally(() => setLoading({...loading, parents: false}));
  };

  const toCreate = (params: any) => {
    setLoading({...loading, confirmed: true});
    doCreate(params)
      .then((response: APIResponse.Response<any>) => {
        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          notification.success({message: '添加成功'});

          if (!params.parent) setParents([]);
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
          if (!params.parent) setParents([]);
          if (props.onUpdate) props.onUpdate();
          if (props.onSave) props.onSave();
        }
      })
      .finally(() => setLoading({...loading, confirmed: false}));
  };

  const toChangeType = (value: string) => {
    if (value != 'page') {
      former.setFieldValue('is_comment', 2);
    }
  };

  const onSubmit = (values: APIBlogCategory.Former) => {
    const params: APIBlogCategory.Editor = {
      parent: values.parent,
      type: values.type,
      name: values.name,
      title: values.title,
      keyword: values.keyword,
      description: values.description,
      order: values.order,
      is_comment: values.is_comment,
      is_enable: values.is_enable,
    };

    if (values.pictures && values.pictures.length > 0) {
      params.picture = values.pictures[0].url;
    }

    if (values.type === 'page') {
      if (rich?.isEmpty()) {
        setTab('content');
        notification.error({message: '页面内容不能为空'});
        return;
      }

      params.content = rich?.getHtml();
    }

    if (props.params) toUpdate(params);
    else toCreate(params);
  };

  const onFailed = (change: any) => {
    const {values}: { values: APIBlogCategory.Former } = change;

    if (!values.name || !values.type) {
      setTab('basic');
    }
  };
  const toInitByUpdate = () => {
    setLoading({...loading, information: true});

    doBlogCategoryByInformation(props.params?.id)
      .then((response: APIResponse.Response<APIBlog.Category>) => {
        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
          if (props.onCancel) props.onCancel();
        } else {
          setInformation(response.data);
        }
      })
      .finally(() => setLoading({...loading, information: false}));
  };

  const toInit = () => {
    setTab('basic');

    if (props.params) {
      toInitByUpdate();
    } else {
      setInformation(undefined);
      former.setFieldsValue({
        parent: undefined,
        type: undefined,
        name: undefined,
        title: undefined,
        keyword: undefined,
        description: undefined,
        pictures: undefined,
        order: 50,
        is_comment: 2,
        is_enable: 1,
      });
    }
  };

  useEffect(() => {
    if (props.visible && information) {
      const data: APIBlogCategory.Former = {
        parent: information.parent || undefined,
        type: information.type,
        name: information.name,
        title: information.title,
        keyword: information.keyword,
        description: information.description,
        order: information.order,
        pictures: undefined,
        is_comment: information.is_comment,
        is_enable: information.is_enable,
      };

      if (information.picture) {
        data.pictures = [{key: 1, url: information.picture, thumbUrl: information.picture}];
      }

      former.setFieldsValue(data);
    }

    if (props.visible && rich && information?.content) {
      rich.setHtml(information.content);
    } else if (props.visible && rich && !rich.isDestroyed) {
      rich.setHtml('');
    }
  }, [props.visible, information, rich]);

  useEffect(() => {
    if (props.visible) {
      toInit();
      if (parents.length <= 0) toParent();
    }
  }, [props.visible]);

  useEffect(() => {
    return () => {
      if (rich != null && !rich.isDestroyed) {
        rich.destroy();
        setRich(null);
      }
    };
  }, [rich]);

  useEffect(() => {
    if (type == 'parent') {
      former.setFieldValue('parent', undefined);
    }
  }, [type]);

  const editor: Partial<IEditorConfig> = {
    // TS 语法
    MENU_CONF: {
      uploadImage: {
        customUpload: async (file: any, insert: any) => {
          const key = crypto.randomUUID();

          notify.open({
            key,
            message: '图片正在上传中',
            icon: <LoadingOutlined/>,
          });

          const response: APIResponse.Response<APIBasic.Upload> = await doUpload(
            file,
            '/category/rich-text',
          );

          if (response.code != Constants.Success) {
            notify.error({key, message: response.message});
          } else {
            notify.success({key, message: '图片上传成功'});

            insert(response.data.url, response.data.name, '');
          }
        },
      },
    },
  };

  const toolbar: Partial<IToolbarConfig> = {
    excludeKeys: ['fontFamily', 'group-video', 'undo', 'redo'],
  };

  return (
    <>
      {context}
      <Modal
        width={660}
        open={props.visible}
        closable={false}
        centered
        maskClosable={false}
        onOk={former.submit}
        onCancel={props.onCancel}
        confirmLoading={loading.confirmed}
      >
        <Spin spinning={!!loading.information} tip="数据加载中...">
          <Form form={former} onFinishFailed={onFailed} onFinish={onSubmit} labelCol={{span: 2}}>
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
                      <Form.Item label="栏目" name="parent">
                        <Select
                          allowClear
                          disabled={!!props.params || type == 'parent'}
                          options={parents.map(item => ({label: item.name, value: item.id}))}
                          loading={loading.parents}
                        />
                      </Form.Item>
                      <Form.Item
                        label="名称"
                        name="name"
                        rules={[{required: true}, {max: 120}]}
                      >
                        <Input/>
                      </Form.Item>
                      <Form.Item label="类型" name="type" rules={[{required: true}]}>
                        <Select
                          disabled={!!props.params}
                          options={[
                            {label: '单页', value: 'page'},
                            {label: '列表', value: 'list'},
                            {label: '父级', value: 'parent'},
                          ]}
                          onChange={toChangeType}/>
                      </Form.Item>
                      <Form.Item
                        label="排序"
                        name="order"
                        rules={[{required: true}, {type: 'number'}]}
                      >
                        <InputNumber min={1} max={99} controls={false} style={{width: '100%'}}/>
                      </Form.Item>
                      <Form.Item label="启用" name="is_enable" rules={[{required: true}]}>
                        <Select options={[{label: '是', value: 1}, {label: '否', value: 2}]}/>
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'seo',
                  label: 'SEO',
                  forceRender: true,
                  disabled: type == 'parent',
                  children: (
                    <>
                      <Form.Item name="title" label="标题" rules={[{max: 255}]}>
                        <Input/>
                      </Form.Item>
                      <Form.Item name="keyword" label="词组" rules={[{max: 255}]}>
                        <Input.TextArea rows={3} showCount maxLength={255}/>
                      </Form.Item>
                      <Form.Item name="description" label="描述" rules={[{max: 255}]}>
                        <Input.TextArea rows={3} showCount maxLength={255}/>
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'other',
                  label: '其他',
                  forceRender: true,
                  disabled: type == 'parent',
                  children: (
                    <>
                      <Form.Item
                        label="图片"
                        name="pictures"
                        valuePropName="fileList"
                        getValueFromEvent={onUpload}
                      >
                        <Upload.Dragger
                          name="file"
                          listType="picture-card"
                          showUploadList={false}
                          maxCount={1}
                          className={styles.upload}
                          action={Constants.Upload}
                          headers={{
                            Authorization: localStorage.getItem(Constants.Authorization) as string,
                          }}
                          data={{dir: '/category/picture'}}
                        >
                          <Spin spinning={!!loading.upload} tip="Loading...">
                            {pictures && pictures.length > 0 ? (
                              <img
                                src={pictures[0].thumbUrl}
                                alt="avatar"
                                style={{width: '100%'}}
                              />
                            ) : (
                              <div className="upload-area">
                                <p className="ant-upload-drag-icon">
                                  <InboxOutlined className="upload-icon"/>
                                </p>
                                <p className="ant-upload-text">点击或拖动文件到该区域进行上传</p>
                                <p className="ant-upload-hint">
                                  Support for a single or bulk upload. Strictly prohibit from
                                  uploading company data or other band files.
                                </p>
                              </div>
                            )}
                          </Spin>
                        </Upload.Dragger>
                      </Form.Item>
                      <Form.Item label="留言" name="is_comment" rules={[{required: true}]}>
                        <Select
                          disabled={type != 'page'}
                          options={[
                            {label: '开启', value: 1},
                            {label: '关闭', value: 2},
                          ]}/>
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'content',
                  label: '内容',
                  forceRender: true,
                  disabled: type !== 'page',
                  children: (
                    <div className={styles.rich}>
                      <Toolbar
                        editor={rich}
                        defaultConfig={toolbar}
                        mode="default"
                        style={{borderBottom: '1px solid #ccc'}}
                      />
                      <RichText
                        defaultConfig={editor}
                        onCreated={setRich}
                        mode="default"
                        className={styles.content}
                      />
                    </div>
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
