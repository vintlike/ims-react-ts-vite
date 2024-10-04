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
import { BMapLoader, IMapType, MapKeyConfig } from './MapConfig';
import SceneService from './lib/SceneService';

interface Props {
  onRef: any;
  style?: React.CSSProperties;
  callback?: (lnglat: number[]) => void;
}

export default function BMapAdapter(props: Props) {
  const { onRef, style, callback } = props;

  const mapType: IMapType = 'bmap';
  const [sceneService, setSceneService] = useState<any>(null);

  const mapRef = useRef<any>();
  const [lnglat, setLnglat] = useState<number[]>([]);

  /**
   * 加载地图实例
   */
  const loadMap = useCallback(async () => {
    let MapEntity: any = null;
    const { key, version, type } = MapKeyConfig[mapType] ?? {};

    await BMapLoader({
      ak: key,
      v: version,
      type,
    }).then(() => {
      MapEntity = window.BMapGL;
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
    <div ref={mapRef} className="map-container map-bmap" style={style}></div>
  );
}
