import React, {useEffect, useState} from 'react';
import {useAccess, Access, useModel} from 'umi';
import {Button, Card, notification, Popconfirm, Space, Switch, Table, Tag, Tooltip} from 'antd';
import {FormOutlined, RedoOutlined} from '@ant-design/icons';
import Editor from '@/pages/Site/User/Editor';
import Enable from '@/components/Basic/Enable';
import {doDelete, doEnable, doPaginate} from './service';
import Constants from '@/utils/Constants';
import Loop from '@/utils/Loop';
import dayjs from "dayjs";

const Paginate: React.FC = () => {

  const access = useAccess();
  const {initialState} = useModel('@@initialState');

  const [load, setLoad] = useState(false);
  const [search, setSearch] = useState<APISiteUsers.Search>({});
  const [editor, setEditor] = useState<APISiteUsers.Data | undefined>();
  const [visible, setVisible] = useState<APISiteUsers.Visible>({});
  const [data, setData] = useState<APIData.Paginate<APISiteUsers.Data>>();

  const toPaginate = () => {
    setLoad(true);
    doPaginate(search)
      .then(response => {
        if (response.code === Constants.Success) {
          setData(response.data);
        }
      })
      .finally(() => setLoad(false));
  };

  const onEnable = (record: APISiteUsers.Data) => {

    if (data?.data) {
      const temp = {...data}
      if (temp.data) {
        Loop.ById(temp.data, record.id, item => (item.loading_enable = true))
      }
      setData(temp)
    }

    const enable: APIRequest.Enable<number> = {id: record.id, is_enable: record.is_enable === 1 ? 2 : 1};

    doEnable(enable)
      .then(response => {

        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          notification.success({message: `${enable.is_enable === 1 ? '启用' : '禁用'}成功！`});

          if (data?.data) {
            const temp = {...data}
            if (temp.data) {
              Loop.ById(temp.data, record.id, item => (item.is_enable = enable.is_enable))
            }
            setData(temp)
          }
        }
      })
      .finally(() => {

        if (data?.data) {
          const temp = {...data}
          if (temp.data) {
            Loop.ById(temp.data, record.id, item => (item.loading_enable = false))
          }
          setData(temp)
        }
      });
  };

  const onDelete = (record: APISiteUsers.Data) => {

    if (data?.data) {
      const temp = {...data}
      if (temp.data) {
        Loop.ById(temp.data, record.id, item => (item.loading_deleted = true))
      }
      setData(temp)
    }

    doDelete(record.id)
      .then(response => {

        if (response.code !== Constants.Success) {
          notification.error({message: response.message});
        } else {
          notification.success({message: '删除成功！'});
          toPaginate();
        }
      })
      .finally(() => {
        if (data?.data) {
          const temp = {...data}
          if (temp.data) {
            Loop.ById(temp.data, record.id, item => (item.loading_deleted = false))
          }
          setData(temp)
        }
      });
  };

  const onCreate = () => {
    setEditor(undefined);
    setVisible({...visible, editor: true});
  };

  const onUpdate = (record: APISiteUsers.Data) => {
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
        title="账号列表"
        extra={
          <Space size={[10, 10]}>
            <Tooltip title="刷新">
              <Button type="primary" icon={<RedoOutlined/>} onClick={toPaginate} loading={load}/>
            </Tooltip>
            <Access accessible={access.page('site.user.create')}>
              <Tooltip title="创建">
                <Button type="primary" icon={<FormOutlined/>} onClick={onCreate}/>
              </Tooltip>
            </Access>
          </Space>
        }
      >
        <Table
          rowKey="id"
          dataSource={data?.data}
          loading={load}
          pagination={{
            current: data?.page,
            pageSize: data?.size,
            total: data?.total,
            showQuickJumper: false,
            showSizeChanger: false,
            onChange: (page) => setSearch({...search, page}),
          }}
        >
          <Table.Column title="昵称" dataIndex="nickname"/>
          <Table.Column
            title="用户名"
            render={(record: APISiteUsers.Data) => (
              <span style={{color: initialState?.settings?.colorPrimary}}>{record.username}</span>
            )}
          />
          <Table.Column
            title="其他"
            render={(record: APISiteUsers.Data) => (
              [record.mobile, record.email]
                .filter(item => item)
                .join('、')
            )}
          />
          <Table.Column
            title="角色"
            align='center'
            render={(record: APISiteUsers.Data) =>
              record.roles?.map((item) => (
                <Tag key={item.id} color={initialState?.settings?.colorPrimary}>
                  {item.name}
                </Tag>
              ))
            }
          />
          <Table.Column
            title="启用"
            align="center"
            render={(record: APISiteUsers.Data) => (
              <Access
                accessible={access.page("site.user.enable")}
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
            width={120}
            align='center'
            render={(record: APISiteUsers.Data) =>
              record.created_at && dayjs(record.created_at).format('YY/MM/DD')
            }
          />
          <Table.Column
            title="操作"
            align="center"
            width={100}
            render={(record: APISiteUsers.Data) => (
              <>
                <Access accessible={access.page("site.user.update")}>
                  <Button type="link" onClick={() => onUpdate(record)}>
                    编辑
                  </Button>
                </Access>
                <Access accessible={access.page("site.user.delete")}>
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
