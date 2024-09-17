import { lnglatParser, loadMapScript } from '@/pages/Map/MapUtil';
import { Button, Form, Input, Space } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MapLayout } from './MapStyle';

import AMapLoader from '@amap/amap-jsapi-loader';
import { LineLayer, PointLayer, Scene } from '@antv/l7';
import {  GaodeMap } from '@antv/l7-maps';
import {
  GeometryTypeMap,
  IFeatureCollectionProps,
  MapConfig,
  MapKeyConfig,
  MapLayerConfig,
} from './MapConfig';

const { TextArea } = Input;

export default function MapGaode() {
  const [formInstance] = Form.useForm();
  const [geoCodeForm] = Form.useForm();
  const [regeoCodeForm] = Form.useForm();
  const [data, setData] = useState<any>([]);

  const mapRef = useRef<any>();
  const { shape, size, color } = MapLayerConfig;
  const sceneInstance = useRef<any>(null);
  const mapType = 'gaode';

  const switchLocationOrAddress = useCallback(
    (key: 'geoCode' | 'regeoCode' = 'geoCode') => {
      

      const AMap = (window as any)?.AMap;
      const map = sceneInstance.current.map;

      AMap.plugin('AMap.Geocoder', function() {
        const geocoder = new AMap.Geocoder({
          radius: 3000, //范围，默认：500
          city: '010' //城市设为北京，默认：“全国”
        });
        const marker: any = new AMap.Marker();
  
        // 地理编码（地址->坐标）
        function geoCode() {
          const address: string = regeoCodeForm.getFieldValue(['address']) ?? '';
          if (!address.trim()) {
            return console.error('请输入地址');
          }
  
          // TODO 下面代码执行不下去，原因未知
          geocoder.getLocation(address, function (status: any, result: any) {
            //如果服务请求状态为“error”
            if (status == 'error') {
              console.error('服务请求出错啦！');
            }
            //如果服务请求状态为“no_data”， “no_data”是指服务请求正常，但根据检索条件无结果返回，建议更换检索条件
            if (status == 'no_data') {
              console.error('无数据返回，请换个关键字试试～～');
            }
  
            if (status === 'complete' && result.geocodes.length) {
              const lnglat = result.geocodes[0].location;
  
              marker.setPosition(lnglat);
              map.add(marker);
              map.setFitView(marker);
  
              regeoCodeForm.setFieldsValue({
                lnglat
              });
            } else {
              console.error('根据地址查询位置失败');
            }
          });
        }
  
        // 逆地理编码（坐标->地址）
        function regeoCode() {
          const lnglat: number[] =
          geoCodeForm.getFieldValue(['lnglat']).split(/,|\s+|_/) ?? [];
  
          const [lng, lat] = lnglat ?? [];
  
          if (lnglat.length === 0) {
            return console.error('输入或点击地图获取经纬度');
          }
  
          map.add(marker);
          marker.setPosition([Number(lng), Number(lat)]);
  
          geocoder.getAddress(
            [Number(lng), Number(lat)],
            function (status: any, result: any) {
              //如果服务请求状态为“error”
              if (status == 'error') {
                console.error('服务请求出错啦！');
              }
              //如果服务请求状态为“no_data”， “no_data”是指服务请求正常，但根据检索条件无结果返回，建议更换检索条件
              if (status == 'no_data') {
                console.error('无数据返回，请换个关键字试试～～');
              }
              if (status === 'complete' && result.regeocode) {
                const address = result.regeocode.formattedAddress;
  
                geoCodeForm.setFieldsValue({
                  address
                });
              } else {
                console.error('根据经纬度查询地址失败');
              }
            }
          );
        }
  
        if (key === 'geoCode') {
          geoCode();
        } else if (key === 'regeoCode') {
          regeoCode();
        }
      });

      
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
      }

      const scene: any = new Scene({
        id: mapRef.current,
        logoVisible: false,
        map: new GaodeMap({
          mapInstance: map // 将外部的高德地图实例传进L7，这样传进L7控制台会不停报错，原因未知
          // ...mapOptions
        })
      });

      sceneInstance.current = scene;

      scene.on('loaded', () => {
        (scene?.map as any)?.on('click', (e: any) => {
          const { lng, lat } = e.lnglat;
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
    // 本地配置 安全密钥（确保这行代码 比 AMapLoader.load 先执行即可，写在别处也行）
    (window as any)._AMapSecurityConfig = {
      securityJsCode: MapKeyConfig[mapType].securityJsCode
    };
    /** scene这个实例一定要在dom渲染完成之后创建 */
    
    loadMapScript(mapType)
      .then((AMap) => {
        initMap(AMap);
      })
      .catch(() => {
        console.log('高德地图加载失败');
      });
    // AMapLoader.load({
    //   key: MapKeyConfig[mapType].key, // 申请好的 Web 端开发者 Key，首次调用 load 时必填
    //   version: MapKeyConfig[mapType].version, // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    //   plugins: ['AMap.Geocoder'] // 需要使用的的插件列表，如比例尺'AMap.Scale'、'AMap.Geocoder'等
    // })
    //   .then((AMap) => {
    //     // JS API 加载完成后获取AMap对象
    //     initMap(AMap);
    //   })
    //   .catch(() => {
    //     console.error('高德地图加载失败'); //加载错误提示
    //   });
  }, [initMap, mapType]);

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
