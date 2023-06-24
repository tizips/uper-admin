import React, {useEffect, useState} from 'react';
import {Cascader, Form, Input, Modal, notification, Select, Spin, Tabs, Upload} from 'antd';
import {InboxOutlined, LoadingOutlined} from '@ant-design/icons';
import {IDomEditor, IEditorConfig, IToolbarConfig} from '@wangeditor/editor';
import {Editor as RichText, Toolbar} from '@wangeditor/editor-for-react';
import {doUpload} from '@/services/helper';
import {doBlogArticleByInformation, doBlogCategoryByOpening} from '@/services/blog';
import {doCreate, doUpdate} from './service';
import Constants from '@/utils/Constants';

import styles from './index.less';

const Editor: React.FC<APISiteArticle.Props> = (props) => {

  const [former] = Form.useForm<APISiteArticle.Former>();
  const [rich, setRich] = useState<IDomEditor | null>(null); // TS 语法

  const [notify, context] = notification.useNotification();

  const [information, setInformation] = useState<APIBlog.Article<string[]>>();
  const [categories, setCategories] = useState<APIData.Enable<string>[]>([]);
  const [loading, setLoading] = useState<APISiteArticle.Loading>({});
  const [tab, setTab] = useState('basic');

  const source = Form.useWatch('source', former);
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
      } else {
        e.fileList?.forEach((item: any) => {
          if (item.uid == uid) item.thumbUrl = response.data.url;
        });
      }
    }

    return e && e.fileList;
  };

  const toCategory = () => {
    setLoading({...loading, category: true});
    doBlogCategoryByOpening()
      .then((response: APIResponse.Response<APIData.Enable<string>[]>) => {
        if (response.code === Constants.Success) {
          setCategories(response.data);
        }
      })
      .finally(() => setLoading({...loading, category: false}));
  };

  const toCreate = (params: any) => {
    setLoading({...loading, confirmed: true});
    doCreate(params)
      .then((response: APIResponse.Response<any>) => {
        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          notification.success({message: '添加成功'});

          if (!params.parent) setCategories([]);
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
          if (!params.parent) setCategories([]);
          if (props.onUpdate) props.onUpdate();
          if (props.onSave) props.onSave();
        }
      })
      .finally(() => setLoading({...loading, confirmed: false}));
  };

  const onSubmit = (values: APISiteArticle.Former) => {

    const params: APISiteArticle.Editor = {
      name: values.name,
      title: values.title,
      keyword: values.keyword,
      description: values.description,
      source: values.source,
      url: values.url,
      is_comment: values.is_comment,
      is_enable: values.is_enable,
    };

    if (values.category && values.category.length > 0) {
      params.category = values.category[values.category.length - 1];
    }

    if (values.pictures && values.pictures.length > 0) {
      params.picture = values.pictures[0].thumbUrl;
    }

    if (rich?.isEmpty()) {
      setTab('content');
      notification.error({message: '页面内容不能为空'});
      return;
    }

    params.text = rich?.getText();
    params.content = rich?.getHtml();

    if (props.params) toUpdate(params);
    else toCreate(params);
  };

  const onFailed = (change: any) => {

    const {values}: { values: APISiteArticle.Former } = change;

    if (!values.name || !values.category) {
      setTab('basic');
    }
  };

  const toInitByUpdate = () => {
    setLoading({...loading, information: true});

    doBlogArticleByInformation(props.params?.id)
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
        category: undefined,
        name: undefined,
        title: undefined,
        keyword: undefined,
        description: undefined,
        pictures: undefined,
        source: undefined,
        url: undefined,
        is_comment: 2,
        is_enable: 1,
      });
    }
  };

  useEffect(() => {

    if (props.visible && information) {

      const data: APISiteArticle.Former = {
        category: information.category || undefined,
        name: information.name,
        title: information.title,
        keyword: information.keyword,
        description: information.description,
        source: information.source,
        url: information.url,
        pictures: undefined,
        is_comment: information.is_comment,
        is_enable: information.is_enable,
      };

      if (information.picture) {
        data.pictures = [{key: 1, thumbUrl: information.picture}];
      }

      former.setFieldsValue(data);
    }

    if (props.visible && rich && !rich.isDestroyed && information?.content) {
      rich.setHtml(information.content);
    } else if (props.visible && rich && !rich.isDestroyed) {
      rich.setHtml('');
    }
  }, [props.visible, information, rich]);

  useEffect(() => {

    if (props.visible) {

      toInit();

      if (categories.length <= 0) {
        toCategory();
      }
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
            '/article/rich-text',
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
                      <Form.Item label="栏目" name="category" rules={[{required: true}]}>
                        <Cascader
                          options={categories}
                          fieldNames={{label: 'name', value: 'id'}}
                          loading={loading.category}
                          allowClear={false}
                        />
                      </Form.Item>
                      <Form.Item
                        label="名称"
                        name="name"
                        rules={[{required: true}, {max: 120}]}
                      >
                        <Input/>
                      </Form.Item>
                      <Form.Item label="转载" name="source" rules={[{max: 32}]}>
                        <Input/>
                      </Form.Item>
                      {source && (
                        <Form.Item
                          label="链接"
                          name="url"
                          rules={[{required: true, max: 12, type: 'url'}]}
                        >
                          <Input placeholder="请输入转载链接"/>
                        </Form.Item>
                      )}
                      <Form.Item label="启用" name="is_enable" rules={[{required: true}]}>
                        <Select
                          options={[
                            {label: '是', value: 1},
                            {label: '否', value: 2},
                          ]}
                        />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'seo',
                  label: 'SEO',
                  forceRender: true,
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
                          data={{dir: '/article/picture'}}
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
                          options={[
                            {label: '开启', value: 1},
                            {label: '关闭', value: 2},
                          ]}
                        />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'content',
                  label: '内容',
                  forceRender: true,
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
