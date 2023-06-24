import React, {useEffect, useState} from 'react';
import {SearchOutlined} from '@ant-design/icons';
import {Map, APILoader, ToolBarControl, Marker} from '@uiw/react-amap';
import {Modal, Select, Spin} from 'antd';

import styles from './index.less';

const Amap: React.FC<APIAmap.Props> = (props) => {

  const [response, setResponse] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const toSearch = (keyword: string) => {
    setSearch(keyword);
  };

  const onSubmit = (event: any) => {

    const pos: { lat: number; lng: number } = {lat: 0, lng: 0};

    if (typeof event === 'string') {

      const data = JSON.parse(event as string);

      if (data.location && data.location.length === 2) {
        pos.lat = data.location[1] as number;
        pos.lng = data.location[0] as number;
      }
    } else if (event instanceof Object && event.lnglat && event.lnglat.lat && event.lnglat.lng) {

      pos.lat = event.lnglat.lat;
      pos.lng = event.lnglat.lng;
    }

    if (props.onSuccess && pos.lat && pos.lng) {
      props.onSuccess(pos.lat, pos.lng);
    }
  };

  useEffect(() => {
    const callSearchService = () => {
      if (search) {
        setLoading(true);
        AMap.plugin(['AMap.AutoComplete'], () => {
          // 实例化AutoComplete
          const autoComplete = new AMap.AutoComplete({
            city: '全国',
          });
          // 根据关键字进行搜索
          autoComplete.search(search, (status, result: any) => {
            // 搜索成功时，result即是对应的匹配数据
            if (status === 'complete') {
              setResponse(result.tips);
            }
            setLoading(false);
          });
        });
      }
    };

    const timeout = setTimeout(() => {
      callSearchService();
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  return (
    <Modal
      title="坐标选择"
      centered
      open={props.visible}
      onCancel={props.onCancel}
      footer={null}
      className={styles.amap}
    >
      <Spin spinning={loading}>
        <div style={{width: '100%', height: '360px'}}>
          <APILoader akay="363e1eb866314aefb8bdbf3c46746367">
            <div className={styles.search}>
              <Select
                showSearch
                showArrow={false}
                filterOption={false}
                onSearch={toSearch}
                onChange={onSubmit}
                notFoundContent={null}
                className={styles.select}
                bordered={false}
                suffixIcon={<SearchOutlined/>}
                placeholder="位置搜索"
              >
                {
                  response.map((item, idx) => (
                    <Select.Option key={idx} value={JSON.stringify(item)}>
                      {item.name}
                    </Select.Option>
                  ))
                }
              </Select>
            </div>
            <Map onClick={onSubmit}
                 center={props.longitude && props.latitude ?
                   [props.longitude, props.latitude] :
                   undefined
                 }>
              {({AMap}) => {
                return (
                  <>
                    <ToolBarControl offset={[10, 10]} position="RT"/>
                    {
                      props.latitude && props.longitude &&
                      <Marker position={new AMap.LngLat(props.longitude, props.latitude)}/>
                    }
                  </>
                )
              }}
            </Map>
          </APILoader>
        </div>
      </Spin>
    </Modal>
  );
};

export default Amap;
