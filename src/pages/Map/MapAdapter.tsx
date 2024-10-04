import { Form, Radio, RadioChangeEvent } from 'antd';
import { useCallback, useRef, useState } from 'react';
import { MapLayout } from './MapStyle';

import AMapAdapter from './AMapAdapter';
import BMapAdapter from './BMapAdapter';
import {
  IMapSceneProps,
  IMapType,
  MapTypeDefault,
  MapTypeList,
} from './MapConfig';
import { MapForm, MapGeoForm, MapRegeoForm } from './MapForm';
import { lnglatParser } from './MapUtil';

interface Props {
  style?: React.CSSProperties;
}

export default function MapAdapter(props: Props) {
  const { style } = props;

  const [mapType, setMapType] = useState<IMapType>(MapTypeDefault);

  const amapRef = useRef<any>();
  const bmapRef = useRef<any>();

  const [formInstance] = Form.useForm();
  const [geoCodeForm] = Form.useForm();
  const [regeoCodeForm] = Form.useForm();

  /**
   * 切换地图类型
   */
  const handleSwitchMap = useCallback(
    ({ target: { value } }: RadioChangeEvent) => {
      setMapType(value);
    },
    [],
  );

  const onFinish = useCallback(
    (values: any, key: string) => {
      const mapRef = (mapType === 'amap' ? amapRef : bmapRef).current;
      mapRef.sceneService.resetLayer();

      if (key === 'mapForm') {
        const { value1, value2, value3 } = values;
        const data: IMapSceneProps[] = [
          {
            data: lnglatParser(value1, mapType),
            type: 'line',
          },
          {
            data: lnglatParser(value2, mapType),
            type: 'line',
            color: '#0DCCFF',
            size: 40,
            shape: 'wall',
            style: {
              opacity: 1,
              sourceColor: '#0DCCFF',
              targetColor: 'rgba(255,255,255, 0)',
            },
          },
          {
            data: lnglatParser(value3, mapType),
            type: 'point',
            color: '#415fff',
          },
        ];

        data?.map((item: any) => {
          mapRef.sceneService.drawLayer(item);
        });
      } else if (key === 'geoForm') {
        const { address } = values;

        mapRef.sceneService.geoCode(address, (lnglat: number[]) => {
          geoCodeForm.setFieldsValue({
            lnglat,
          });
        });
      } else if (key === 'regeoForm') {
        let { lnglat = '' } = values;

        lnglat = lnglat
          ?.trim()
          .split(/,|\s+|_/)
          .join(',');

        lnglat = lnglatParser(lnglat, mapType)[0] ?? [];
        mapRef.sceneService.regeoCode(lnglat, (address: string) => {
          regeoCodeForm.setFieldsValue({
            address,
          });
        });
      }
    },
    [geoCodeForm, mapType, regeoCodeForm],
  );

  const onMapCallback = useCallback(
    (lnglat: number[]) => {
      const mapRef = (mapType === 'amap' ? amapRef : bmapRef).current;

      regeoCodeForm.setFieldsValue({
        lnglat: lnglat.join(','),
        address: '',
      });

      geoCodeForm.setFieldsValue({
        lnglat: lnglat.join(','),
        address: '',
      });

      mapRef.sceneService.regeoCode(lnglat, (value: string) => {
        regeoCodeForm.setFieldsValue({
          address: value,
        });
        geoCodeForm.setFieldsValue({
          address: value,
        });
      });
    },
    [mapType, regeoCodeForm, geoCodeForm],
  );

  return (
    <MapLayout style={style}>
      <div className="map-head">
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          value={mapType}
          options={MapTypeList.map((item) => ({
            label: item.label,
            value: item.value,
          }))}
          onChange={handleSwitchMap}
        />
      </div>
      <div className="map-form">
        <MapForm
          form={formInstance}
          callback={(values) => onFinish(values, 'mapForm')}
        />
        <MapRegeoForm
          form={regeoCodeForm}
          callback={(values) => onFinish(values, 'regeoForm')}
        />
        <MapGeoForm
          form={geoCodeForm}
          callback={(values) => onFinish(values, 'geoForm')}
        />
      </div>
      <div className="map-content">
        {/* 用visibility控制显示隐藏，用display控制时，百度地图的中心点会偏移 */}
        <AMapAdapter
          onRef={amapRef}
          callback={onMapCallback}
          style={{
            visibility: mapType === 'amap' ? 'visible' : 'hidden',
          }}
        />
        <BMapAdapter
          onRef={bmapRef}
          callback={onMapCallback}
          style={{
            visibility: mapType === 'bmap' ? 'visible' : 'hidden',
          }}
        />
      </div>
    </MapLayout>
  );
}
