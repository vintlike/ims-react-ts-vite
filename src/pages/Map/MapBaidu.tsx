import { lnglatParser } from '@/pages/Map/MapUtil';
import { Button, Form, Input, Space } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MapLayout } from './MapStyle';

import { LineLayer, PointLayer, Scene } from '@antv/l7';
import { BaiduMap } from '@antv/l7-maps';
import {
  GeometryTypeMap,
  IFeatureCollectionProps,
  MapConfig,
  MapKeyConfig,
  MapLayerConfig
} from './MapConfig';

const { TextArea } = Input;

export default function MapBaidu() {
  const [formInstance] = Form.useForm();
  const [geoCodeForm] = Form.useForm();
  const [regeoCodeForm] = Form.useForm();
  const [data, setData] = useState<any>([]);

  const mapRef = useRef<any>();
  const { shape, size, color } = MapLayerConfig;
  const sceneInstance = useRef<any>(null);
  const mapType = 'baidu';

  const switchLocationOrAddress = useCallback(
    (key: 'geoCode' | 'regeoCode' = 'geoCode') => {
      const lnglat: number[] =
        geoCodeForm.getFieldValue(['lnglat']).split(/,|\s+|_/) ?? [];

      const [lng, lat] = lnglat ?? [];

      const AMap = (window as any)?.BMapGL;
      const map = sceneInstance.current.map;

      const geocoder = new AMap.Geocoder({
        radius: 3000, //范围，默认：500
        city: '010' //城市设为北京，默认：“全国”
      });

      // 创建点坐标
      const point = new AMap.Point(Number(lng), Number(lat));
      // 创建Point点标记
      const marker = new AMap.Marker(point);
      // 地图设置中心点和放大级别
      map.centerAndZoom(point, MapConfig.zoom);

      // 地理编码（地址->坐标）
      function geoCode() {
        const address: string = regeoCodeForm.getFieldValue(['address']) ?? '';
        if (!address.trim()) {
          return console.error('请输入地址');
        }

        // TODO 下面代码执行不下去，原因未知
        geocoder.getPoint(address, function (point: any) {
          if (point) {
            map.centerAndZoom(point, MapConfig.zoom);
            map.addOverlay(new AMap.Marker(point));
          }

          const lnglat = Object.values(point);

          regeoCodeForm.setFieldsValue({
            lnglat
          });
        });
      }

      // 逆地理编码（坐标->地址）
      function regeoCode() {
        if (lnglat.length === 0) {
          return console.error('输入或点击地图获取经纬度');
        }

        // 地图添加点标记
        map.addOverlay(marker);

        geocoder.getLocation(point, function (result: any) {
          if (result) {
            const address = result.address;

            geoCodeForm.setFieldsValue({
              address
            });
          } else {
            console.error('根据经纬度查询地址失败');
          }
        });
      }

      if (key === 'geoCode') {
        geoCode();
      } else if (key === 'regeoCode') {
        regeoCode();
      }
    },
    [geoCodeForm, regeoCodeForm]
  );

  const initMap = useCallback(
    (MapEntity?: any) => {
      const mapOptions = {
        ...MapConfig,
        token: MapKeyConfig[mapType].key
      };

      // 用AMap.Map创建地图实例（页面控制台会有报错）
      // 百度的是BMapGL，高德的是AMap
      let map = null;
      if (MapEntity) {
        map = new MapEntity.Map(mapRef.current, {
          ...mapOptions
        });
        // 百度地图需要执行centerAndZoom进行初始化
        map.centerAndZoom(
          new window.BMapGL.Point(MapConfig.center[0], MapConfig.center[1]),
          MapConfig.zoom
        );
        // 默认滚轮缩放禁用，需要如下执行开启
        map.enableScrollWheelZoom();
      }

      const scene: any = new Scene({
        id: mapRef.current,
        logoVisible: false,
        map: new BaiduMap({
          mapInstance: map // 将外部的高德地图实例传进L7，这样传进L7控制台会不停报错，原因未知
          // ...mapOptions
        })
      });

      sceneInstance.current = scene;

      scene.on('loaded', () => {
        //   // 创建点坐标
        //   const point = new window.BMapGL.Point(
        //     MapConfig.center[0],
        //     MapConfig.center[1]
        //   );
        //   // 创建Point点标记
        //   const pointMarker = new window.BMapGL.Marker(point);

        //   // 百度地图需要执行centerAndZoom进行初始化
        //   (scene?.map as any)?.centerAndZoom(point, 10);
        //   // 地图添加点标记
        //   (scene?.map as any)?.addOverlay(pointMarker);

        //   // 默认滚轮缩放禁用，需要如下执行开启
        //   (scene?.map as any)?.enableScrollWheelZoom();

        (scene?.map as any)?.on('click', (e: any) => {
          const { lng, lat } = e.latlng;
          geoCodeForm.setFieldsValue({
            lnglat: `${lng},${lat}`,
            address: ''
          });

          switchLocationOrAddress('regeoCode');
        });

        if (data?.length > 0) {
          data?.map((item: any) => {
            const {
              data: childData,
              type: childType,
              color: childColor,
              shape: childShape,
              size: childSize
            } = item;

            if (childData?.length > 0) {
              const mapData: IFeatureCollectionProps = {
                type: 'FeatureCollection',
                features: (childType === 'point' ? childData[0] : childData)
                  ?.filter((v: any) => v !== undefined)
                  ?.map((childItem: any) => {
                    return {
                      type: 'Feature',
                      properties: {},
                      geometry: {
                        type: GeometryTypeMap[childType],
                        coordinates: childItem
                      }
                    };
                  })
              };

              if (childType === 'line') {
                const lineLayer = new LineLayer({
                  autoFit: true
                })
                  .source(mapData)
                  .size(childSize ?? size) // shape为simple时，size 方法不生效 线宽始终为 1px
                  .shape(childShape ?? shape)
                  .color(childColor ?? color)
                  .style({
                    opacity: 1
                  });
                scene.addLayer(lineLayer);
              } else if (childType === 'point') {
                const pointLayer = new PointLayer({ autoFit: true })
                  .source(mapData)
                  .size(childSize ?? size)
                  .shape(childShape ?? shape)
                  .color(childColor ?? color)
                  .style({
                    opacity: 1,
                    strokeWidth: 3
                  });
                scene.addLayer(pointLayer);
              }
            }
          });
        }
      });
    },
    [data, size, shape, color, geoCodeForm, switchLocationOrAddress]
  );

  const drawMap = useCallback(() => {
    initMap(window.BMapGL);
    // loadMapScript(mapType)
    //   .then((BMapGL) => {
    //     // initMap(BMapGL);
    //     // 创建Map实例
    //     const map = new BMapGL.Map(mapRef.current);

    //     // 创建点坐标
    //     const point = new BMapGL.Point(116.404, 39.915);
    //     // 创建Point点标记
    //     const pointMarker = new BMapGL.Marker(
    //       new BMapGL.Point(116.404, 39.915)
    //     );
    //     // 地图设置中心点和放大级别
    //     map.centerAndZoom(point, 10);
    //     // 地图添加点标记
    //     map.addOverlay(pointMarker);
    //   })
    //   .catch(() => {
    //     console.log('百度地图加载失败');
    //   });
  }, [initMap]);

  const onFinish = useCallback((values: any) => {
    const { value1, value2, value3 } = values;

    setData([
      { data: [lnglatParser(value1, mapType)], type: 'line' },
      {
        data: [lnglatParser(value2, mapType)],
        type: 'line',
        color: '#0DCCFF'
      },
      {
        data: [lnglatParser(value3, mapType)],
        type: 'point',
        color: '#415fff'
      }
    ]);
  }, []);

  const clear = useCallback(
    (key?: string) => {
      if (key === 'geoCodeForm') {
        geoCodeForm.resetFields();
      } else if (key === 'regeoCodeForm') {
        regeoCodeForm.resetFields();
      } else if (key === 'baseForm') {
        formInstance.resetFields();
      } else {
        geoCodeForm.resetFields();
        regeoCodeForm.resetFields();
        formInstance.resetFields();
      }
      setData([]);
    },
    [formInstance, geoCodeForm, regeoCodeForm]
  );

  useEffect(() => {
    drawMap();
  }, [drawMap]);

  return (
    <MapLayout>
      <div>当前显示的是百度地图</div>
      <div className="map-side">
        <Form
          form={formInstance}
          name="baseForm"
          layout="inline"
          colon={false}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          onFinish={onFinish}
        >
          <Form.Item label="经纬度" name="value1" layout="vertical">
            <TextArea
              allowClear
              placeholder="请输入经纬度坐标数据"
              style={{ width: '100%', height: 100, resize: 'none' }}
            />
          </Form.Item>

          <Form.Item label="经纬度（对比）" name="value2" layout="vertical">
            <TextArea
              allowClear
              placeholder="请输入经纬度坐标数据"
              style={{ width: '100%', height: 100, resize: 'none' }}
            />
          </Form.Item>
          <Form.Item label="经纬度（坐标点）" name="value3" layout="vertical">
            <TextArea
              allowClear
              placeholder="请输入经纬度坐标数据"
              style={{ width: '100%', height: 100, resize: 'none' }}
            />
          </Form.Item>
          <Form.Item label=" " layout="vertical">
            <Space size={16} direction="vertical">
              <Button onClick={() => clear('baseForm')}>清空</Button>
              <Button type="primary" htmlType="submit">
                解析
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Form
          form={geoCodeForm}
          name="geoCodeForm"
          layout="inline"
          colon={false}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          onFinish={() => switchLocationOrAddress('regeoCode')}
        >
          <Form.Item label="经纬度" name="lnglat">
            <Input allowClear placeholder="请输入经纬度坐标" />
          </Form.Item>

          <Form.Item label="地&nbsp;&nbsp;&nbsp;&nbsp;址" name="address">
            <Input allowClear />
          </Form.Item>

          <Form.Item label=" ">
            <Space size={16}>
              <Button onClick={() => clear('geoCodeForm')}>清空</Button>
              <Button type="primary" htmlType="submit">
                经纬度-&gt;地址
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Form
          form={regeoCodeForm}
          name="regeoCodeForm"
          layout="inline"
          colon={false}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          onFinish={() => switchLocationOrAddress('geoCode')}
        >
          <Form.Item label="地&nbsp;&nbsp;&nbsp;&nbsp;址" name="address">
            <Input allowClear placeholder="请输入地址" />
          </Form.Item>
          <Form.Item label="经纬度" name="lnglat">
            <Input allowClear />
          </Form.Item>

          <Form.Item label=" ">
            <Space size={16}>
              <Button onClick={() => clear('regeoCodeForm')}>清空</Button>
              <Button type="primary" htmlType="submit">
                地址-&gt;经纬度
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <div className="map-content">
        <div className="map-container" ref={mapRef}></div>
      </div>
    </MapLayout>
  );
}
