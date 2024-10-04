import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { useMount } from 'ahooks';
import { isEmpty } from 'lodash';
import React from 'react';
import { AMapLoader, IMapType, MapKeyConfig } from './MapConfig';
import SceneService from './lib/SceneService';

interface Props {
  onRef: any;
  style?: React.CSSProperties;
  callback?: (lnglat: number[]) => void;
}

export default function AMapAdapter(props: Props) {
  const { onRef, style, callback } = props;

  const mapType: IMapType = 'amap';
  const [sceneService, setSceneService] = useState<any>(null);

  const mapRef = useRef<any>();
  const [lnglat, setLnglat] = useState<number[]>([]);

  /**
   * 加载地图实例
   */
  const loadMap = useCallback(async () => {
    let MapEntity: any = null;
    const { key, version } = MapKeyConfig[mapType] ?? {};

    // 本地配置 安全密钥（确保这行代码 比 AMapLoader.load 先执行即可，写在别处也行）
    (window as any)._AMapSecurityConfig = {
      securityJsCode: MapKeyConfig[mapType].securityJsCode,
    };

    await AMapLoader({
      key, // 申请好的 Web 端开发者 Key，首次调用 load 时必填
      version, // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ['AMap.AutoComplete', 'AMap.Geocoder'], // 需要使用的的插件列表，如比例尺'AMap.Scale'、'AMap.Geocoder'等
    }).then((AMap) => {
      MapEntity = AMap;
    });

    const sceneService = new SceneService(
      mapType,
      mapRef.current,
      {},
      MapEntity,
    );

    setSceneService(sceneService);

    sceneService.scene.on('click', (e: any) => {
      // 获取鼠标当前点的坐标
      const { lng, lat } = e.lnglat || e.lngLat;
      setLnglat([lng, lat]);
    });
  }, [mapType]);

  useImperativeHandle(onRef, () => {
    return {
      sceneService,
      lnglat,
    };
  });

  useMount(() => {
    loadMap();
  });

  useEffect(() => {
    if (!isEmpty(lnglat)) {
      callback && callback(lnglat);
    }
  }, [callback, lnglat]);

  return (
    <div ref={mapRef} className="map-container map-amap" style={style}></div>
  );
}
