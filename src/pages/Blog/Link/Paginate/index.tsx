import React, {useEffect, useState} from 'react';
import {Access, useAccess, useModel} from 'umi';
import {Button, Card, notification, Popconfirm, Space, Switch, Table, Tag, Tooltip} from 'antd';
import {FormOutlined, RedoOutlined} from '@ant-design/icons';
import Editor from '@/pages/Blog/Link/Editor';
import Enable from '@/components/Basic/Enable';
import {doDelete, doEnable, doPaginate} from './service';
import Constants from '@/utils/Constants';
import Loop from '@/utils/Loop';

const Paginate: React.FC = () => {

  const access = useAccess();

  const {initialState} = useModel('@@initialState');

  const [search, setSearch] = useState<APIBlogLinks.Search>({})
  const [editor, setEditor] = useState<APIBlogLinks.Data | undefined>();
  const [load, setLoad] = useState(false);
  const [visible, setVisible] = useState<APIBlogLinks.Visible>({});
  const [data, setData] = useState<APIData.Paginate<APIBlogLinks.Data>>();
  const [expandable, setExpandable] = useState<any[]>([]);

  const toPaginate = () => {
    setLoad(true);
    doPaginate(search)
      .then((response: APIResponse.Paginate<APIBlogLinks.Data>) => {
        if (response.code === Constants.Success) {
          setData(response.data);
        }
      })
      .finally(() => setLoad(false));
  };

  const onDelete = (record: APIBlogLinks.Data) => {
    if (data) {
      const temp = {...data};
      if (temp.data) {
        Loop.ById(temp.data, record.id, (item) => (item.loading_deleted = true));
        setData(temp);
      }
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
          const temp = {...data};
          if (temp.data) {
            Loop.ById(temp.data, record.id, (item) => (item.loading_deleted = false));
            setData(temp);
          }
        }
      });
  };

  const onEnable = (record: APIBlogLinks.Data) => {
    if (data) {
      const temp = {...data};
      if (temp.data) {
        Loop.ById(temp.data, record.id, (item) => (item.loading_enable = true));
        setData(temp);
      }
    }

    const enable: APIRequest.Enable<number> = {
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
            const temp = {...data};
            if (temp.data) {
              Loop.ById(temp.data, record.id, (item) => (item.is_enable = enable.is_enable));
              setData(temp);
            }
          }
        }
      })
      .finally(() => {
        if (data) {
          const temp = {...data};
          if (temp.data) {
            Loop.ById(temp.data, record.id, (item) => (item.loading_enable = false));
            setData(temp);
          }
        }
      });
  };

  const onCreate = () => {
    setEditor(undefined);
    setVisible({...visible, editor: true});
  };

  const onUpdate = (record: APIBlogLinks.Data) => {
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
        title="友链列表"
        extra={
          <Space size={[10, 10]}>
            <Tooltip title="刷新">
              <Button type="primary" icon={<RedoOutlined/>} onClick={toPaginate} loading={load}/>
            </Tooltip>
            <Access accessible={access.page('blog.link.create')}>
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
            pageSize: data?.size,
            current: data?.page,
            total: data?.total,
            showQuickJumper: false,
            onChange: page => setSearch({...search, page})
          }}
        >
          <Table.Column title="名称" dataIndex="name"/>
          <Table.Column title="邮箱" align="center" dataIndex='email'/>
          <Table.Column
            title="序号"
            align="center"
            render={(record: APIBlogLinks.Data) => (
              <Tag color={initialState?.settings?.colorPrimary}>{record.order}</Tag>
            )}
          />
          <Table.Column
            title="启用"
            align="center"
            render={(record: APIBlogLinks.Data) => (
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
            render={(record: APIBlogLinks.Data) => (
              <>
                <Access accessible={access.page('blog.link.update')}>
                  <Button type="link" onClick={() => onUpdate(record)}>
                    编辑
                  </Button>
                </Access>
                <Access accessible={access.page('blog.link.delete')}>
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
