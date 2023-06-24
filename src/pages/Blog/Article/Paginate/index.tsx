import React, {useEffect, useState} from 'react';
import {Access, useAccess, useModel} from 'umi';
import {Button, Card, notification, Popconfirm, Space, Switch, Table, Tag, Tooltip} from 'antd';
import {FormOutlined, RedoOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';
import Enable from '@/components/Basic/Enable';
import Editor from '@/pages/Blog/Article/Editor';
import {doDelete, doEnable, doPaginate} from './service';
import Constants from '@/utils/Constants';
import Loop from '@/utils/Loop';

const Paginate: React.FC = () => {

  const access = useAccess();
  const {initialState} = useModel('@@initialState');

  const [load, setLoad] = useState(false);
  const [search, setSearch] = useState<APIBlogArticles.Search>({});
  const [editor, setEditor] = useState<APIBlogArticles.Data | undefined>();
  const [visible, setVisible] = useState<APIBlogArticles.Visible>({});
  const [data, setData] = useState<APIData.Paginate<APIBlogArticles.Data>>();

  const toPaginate = () => {
    setLoad(true);
    doPaginate(search)
      .then((response: APIResponse.Paginate<APIBlogArticles.Data>) => {
        if (response.code === Constants.Success) {
          setData(response.data);
        }
      })
      .finally(() => setLoad(false));
  };

  const onDelete = (record: APIBlogArticles.Data) => {
    if (data?.data) {
      const temp = {...data};
      if (temp.data) {
        Loop.ById(temp.data, record.id, (item) => (item.loading_deleted = true));
      }
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
        if (data?.data) {
          const temp = {...data};
          if (temp.data) {
            Loop.ById(temp.data, record.id, (item) => (item.loading_deleted = false));
          }
          setData(temp);
        }
      });
  };

  const onEnable = (record: APIBlogArticles.Data) => {
    if (data?.data) {
      const temp = {...data};
      if (temp.data) {
        Loop.ById(temp.data, record.id, (item) => (item.loading_enable = true));
      }
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

          if (data?.data) {
            const temp = {...data};
            if (temp.data) {
              Loop.ById(temp.data, record.id, (item) => (item.is_enable = enable.is_enable));
            }
            setData(temp);
          }
        }
      })
      .finally(() => {
        if (data?.data) {
          const temp = {...data};
          if (temp.data) {
            Loop.ById(temp.data, record.id, (item) => (item.loading_enable = false));
          }
          setData(temp);
        }
      });
  };

  const onCreate = () => {
    setEditor(undefined);
    setVisible({...visible, editor: true});
  };

  const onUpdate = (record: APIBlogArticles.Data) => {
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
  }, [search]);

  return (
    <>
      <Card
        title="文章列表"
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
          dataSource={data?.data}
          rowKey="id"
          loading={load}
          pagination={{
            current: data?.page,
            pageSize: data?.size,
            total: data?.total,
            showQuickJumper: false,
            onChange: (page) => setSearch({page}),
          }}
        >
          <Table.Column title="名称" dataIndex="name"/>
          <Table.Column
            title="栏目"
            align="center"
            render={(record: APIBlogArticles.Data) => (
              <Tag color={initialState?.settings?.colorPrimary}>{record.category}</Tag>
            )}
          />
          <Table.Column
            title="启用"
            align="center"
            render={(record: APIBlogArticles.Data) => (
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
            title="创建时间"
            align="center"
            render={(record: APIBlogArticles.Data) =>
              record.created_at && dayjs(record.created_at).format('YYYY/MM/DD')
            }
          />
          <Table.Column
            title="操作"
            align="center"
            width={100}
            render={(record: APIBlogArticles.Data) => (
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

export default Paginate;
