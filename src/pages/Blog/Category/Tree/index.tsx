import React, {useEffect, useState} from 'react';
import {Access, useAccess, useModel} from 'umi';
import {Button, Card, notification, Popconfirm, Space, Switch, Table, Tag, Tooltip} from 'antd';
import {FormOutlined, RedoOutlined} from '@ant-design/icons';
import Enable from '@/components/Basic/Enable';
import Editor from '@/pages/Blog/Category/Editor';
import {doDelete, doEnable, doTree} from './service';
import Constants from '@/utils/Constants';
import {Types} from '@/object/blog';
import Loop from '@/utils/Loop';

const Tree: React.FC = () => {

  const access = useAccess();
  const {initialState} = useModel('@@initialState');

  const [editor, setEditor] = useState<APIBlogCategories.Data | undefined>();
  const [load, setLoad] = useState(false);
  const [visible, setVisible] = useState<APIBlogCategories.Visible>({});
  const [data, setData] = useState<APIBlogCategories.Data[]>();
  const [expandable, setExpandable] = useState<any[]>([]);

  const doLoop = (
    items: APIBlogCategories.Data[],
    callback: (item: APIBlogCategories.Data) => void,
  ) => {
    for (const temp of items) {
      callback(temp);
      if (temp.children) doLoop(temp.children, callback);
    }
  };

  const toPaginate = () => {
    setLoad(true);
    doTree()
      .then((response: APIResponse.Response<APIBlogCategories.Data[]>) => {
        if (response.code === Constants.Success) {
          setExpandable(response.data?.map((item) => item.id));
          setData(response.data);
        }
      })
      .finally(() => setLoad(false));
  };

  const onDelete = (record: APIBlogCategories.Data) => {
    if (data) {
      const temp: APIBlogCategories.Data[] = [...data];
      Loop.ById(temp, record.id, (item) => (item.loading_deleted = true));
      setData(temp);
    }

    doDelete(record.id)
      .then((response: APIResponse.Response<any>) => {
        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          notification.success({message: '删除成功！'});
          toPaginate();
        }
      })
      .finally(() => {
        if (data) {
          const temp: APIBlogCategories.Data[] = [...data];
          Loop.ById(temp, record.id, (item) => (item.loading_deleted = false));
          setData(temp);
        }
      });
  };

  const onEnable = (record: APIBlogCategories.Data) => {
    if (data) {
      const temp: APIBlogCategories.Data[] = [...data];
      Loop.ById(temp, record.id, (item) => (item.loading_enable = true));
      setData(temp);
    }

    const enable: APIRequest.Enable<string> = {
      id: record.id,
      is_enable: record.is_enable === 1 ? 2 : 1,
    };

    doEnable(enable)
      .then((response: APIResponse.Response<any>) => {
        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          notification.success({message: `${enable.is_enable === 1 ? '启用' : '禁用'}成功！`});
          if (data) {
            const temp: APIBlogCategories.Data[] = [...data];
            Loop.ById(temp, record.id, (item) => (item.is_enable = enable.is_enable));
            setData(temp);
          }
        }
      })
      .finally(() => {
        if (data) {
          const temp: APIBlogCategories.Data[] = [...data];
          Loop.ById(temp, record.id, (item) => (item.loading_enable = false));
          setData(temp);
        }
      });
  };

  const onCreate = () => {
    setEditor(undefined);
    setVisible({...visible, editor: true});
  };

  const onUpdate = (record: APIBlogCategories.Data) => {
    setEditor(record);
    setVisible({...visible, editor: true});
  };

  const onSuccess = () => {
    setVisible({...visible, editor: false});
    toPaginate();
  };

  const onCancel = () => {
    setVisible({...visible, editor: false});
  };

  useEffect(() => {
    toPaginate();
  }, []);

  return (
    <>
      <Card
        title="栏目列表"
        extra={
          <Space size={[10, 10]}>
            <Tooltip title="刷新">
              <Button type="primary" icon={<RedoOutlined/>} onClick={toPaginate} loading={load}/>
            </Tooltip>
            <Access accessible={access.page('blog.category.create')}>
              <Tooltip title="创建">
                <Button type="primary" icon={<FormOutlined/>} onClick={onCreate}/>
              </Tooltip>
            </Access>
          </Space>
        }
      >
        <Table
          dataSource={data}
          rowKey="id"
          size="small"
          indentSize={50}
          expandable={{
            expandedRowKeys: expandable,
            expandIcon: () => <></>,
          }}
          loading={load}
          pagination={false}
        >
          <Table.Column title="名称" dataIndex="name"/>
          <Table.Column
            title="类型"
            align="center"
            render={(record: APIBlogCategories.Data) =>
              record.type != undefined && Types[record.type] ? (
                <Tag color={Types[record.type].color}>{Types[record.type].label}</Tag>
              ) : (
                record.type
              )
            }
          />
          <Table.Column
            title="序号"
            align="center"
            render={(record: APIBlogCategories.Data) => (
              <Tag color={initialState?.settings?.colorPrimary}>{record.order}</Tag>
            )}
          />
          <Table.Column
            title="启用"
            align="center"
            render={(record: APIBlogCategories.Data) => (
              <Access
                accessible={access.page('blog.category.enable')}
                fallback={<Enable is_enable={record.is_enable}/>}
              >
                <Switch
                  size="small"
                  checked={record.is_enable === 1}
                  onClick={() => onEnable(record)}
                  loading={record.loading_enable}
                />
              </Access>
            )}
          />
          <Table.Column
            title="操作"
            align="center"
            width={100}
            render={(record: APIBlogCategories.Data) => (
              <>
                <Access accessible={access.page('blog.category.update')}>
                  <Button type="link" onClick={() => onUpdate(record)}>
                    编辑
                  </Button>
                </Access>
                <Access accessible={access.page('blog.category.delete')}>
                  <Popconfirm
                    title="确定要删除该数据?"
                    placement="leftTop"
                    onConfirm={() => onDelete(record)}
                  >
                    <Button type="link" danger loading={record.loading_deleted}>
                      删除
                    </Button>
                  </Popconfirm>
                </Access>
              </>
            )}
          />
        </Table>
      </Card>
      <Editor visible={visible.editor} params={editor} onSave={onSuccess} onCancel={onCancel}/>
    </>
  );
};

export default Tree;
