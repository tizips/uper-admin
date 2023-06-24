import React, {useEffect, useState} from 'react';
import {useAccess, Access} from "umi";
import {Button, Card, notification, Popconfirm, Space, Table, Tooltip} from 'antd';
import {FormOutlined, RedoOutlined} from '@ant-design/icons';
import Editor from '@/pages/Site/Role/Editor';
import {doDelete, doPaginate} from './service';
import Constants from '@/utils/Constants';
import Loop from '@/utils/Loop';
import dayjs from "dayjs";

const Paginate: React.FC = () => {

  const access = useAccess();

  const [search, setSearch] = useState<APISiteRoles.Search>({});
  const [editor, setEditor] = useState<APISiteRoles.Data | undefined>();
  const [load, setLoad] = useState(false);
  const [visible, setVisible] = useState<APISiteRoles.Visible>({});
  const [data, setData] = useState<APIData.Paginate<APISiteRoles.Data>>();

  const toPaginate = () => {

    setLoad(true);

    doPaginate(search)
      .then(response => {
        if (response.code === Constants.Success) {
          setData(response.data);
        }
      })
      .finally(() => {

        setLoad(false)
      });
  };

  const onDelete = (record: APISiteRoles.Data) => {

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

  const onUpdate = (record: APISiteRoles.Data) => {
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
        title="角色列表"
        extra={
          <Space size={[10, 10]}>
            <Tooltip title="刷新">
              <Button type="primary" icon={<RedoOutlined/>} onClick={toPaginate} loading={load}/>
            </Tooltip>
            <Access accessible={access.page("site.role.create")}>
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
          <Table.Column title="名称" dataIndex="name"/>
          <Table.Column title="简介" dataIndex="summary"/>
          <Table.Column
            title="创建时间"
            align='center'
            width={120}
            render={(record: APISiteRoles.Data) =>
              record.created_at && dayjs(record.created_at).format('YY/MM/DD')
            }
          />
          <Table.Column
            title="操作"
            align="center"
            width={100}
            render={(record: APISiteRoles.Data) => (
              <>
                <Access accessible={access.page("site.role.update")}>
                  <Button type="link" onClick={() => onUpdate(record)}>
                    编辑
                  </Button>
                </Access>
                <Access accessible={access.page("site.role.delete")}>
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
