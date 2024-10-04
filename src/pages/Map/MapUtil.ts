import { Popup } from '@antv/l7';
import gcoord from 'gcoord';
import {
  IFeatureCollectionProps,
  IFeatureItemProps,
  IGeometryType,
  MapKeyConfig,
} from './MapConfig';

/**
 * 坐标转换器
 */
export const lnglatConverter = (value: string, mapType: string) => {
  if (!value) {
    return;
  }

  const [lng, lat] = value.split(/\s*,\s*|_|\s+/) ?? [];

  let result = [Number(lng), Number(lat)];

  // 将WGS84坐标转换为GCJ02坐标
  result = gcoord.transform(
    result as any, // 经纬度坐标
    gcoord.WGS84, // 当前坐标系
    mapType === 'bmap' ? gcoord.BD09 : gcoord.GCJ02, // 目标坐标系
  );

  return result;
};

/**
 * 解析规则：
 * 先截取从开始到第一次出现逗号","时的字符坐标
 * 如果该坐标是xx_xx,xx_xx或xx xx,xx xx这种格式，则表示包含经度和纬度
 * 如果该坐标是xx这种格式，则表示只有经度
 */

export const lnglatParser = (value: string, mapType: string) => {
  if (!value) {
    return [];
  }

  const regComma = /\s*,\s*/;
  const regUnderscore = /_/;
  const regBlank = /\s+/;

  const lnglat = value.split(regComma);

  if (lnglat.length === 2) {
    return [lnglat];
  }
  const val: number[][] = [];
  // 判断该坐标是否已经包含经度和纬度
  const lngAndLat = value.slice(0, value.indexOf(','));
  const isUnderscore = lngAndLat.indexOf('_') > -1;
  const isBlank = lngAndLat.indexOf(' ') > -1;

  const hasLat = isUnderscore || isBlank;

  const lngAndLatArr = value.split(hasLat ? regComma : regUnderscore);

  lngAndLatArr.forEach((item) => {
    const [lng, lat] = item.split(
      hasLat ? (isUnderscore ? regUnderscore : regBlank) : regComma,
    );

    const result = lnglatConverter(`${lng},${lat}`, mapType);
    if (result) {
      val.push(result);
    }
  });

  return [val];
};

/**
 * 创建线图层或点图层数据
 */
export const getMapData = (
  features: IFeatureItemProps[],
  type: IGeometryType,
) => {
  const mapData: IFeatureCollectionProps = {
    type: 'FeatureCollection',
    features: features
      ?.filter((item: any) => item !== undefined)
      ?.map((item: any) => {
        return {
          type: 'Feature',
          properties: {},
          geometry: {
            type,
            coordinates: item,
          },
        };
      }),
  };

  return mapData;
};

/**
 * 显示当前坐标信息
 * @param scene
 * @param layer
 */
export const showLnglatInfo = (scene: any, layer: any) => {
  layer?.on('mousemove', (e: any) => {
    const popup = new Popup({
      offsets: [0, 0],
      closeButton: false,
    })
      .setLnglat(e.lngLat)
      .setHTML(`<span>坐标：【${e.lngLat.lng}, ${e.lngLat.lat}】</span>`);
    scene?.addPopup(popup);
  });
};

export function loadScript(url: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('async', '');
    script.setAttribute('src', url);
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * 加载地图脚本
 * @param code
 * @returns
 */
export function loadMapScript(code: string) {
  const { key, securityJsCode, version } = MapKeyConfig[code];
  return new Promise((resolve, reject) => {
    const instance = code === 'bmap' ? window.BMapGL : window.AMap;
    const urlMap: Record<string, string> = {
      amap: `https://webapi.amap.com/maps?v=${version}&key=${key}&callback=onCallback`,
      bmap: `https://api.map.baidu.com/api?v=${version}&type=webgl&ak=${key}&callback=onCallback`,
    };
    if (typeof instance !== 'undefined') {
      resolve(instance);
      return;
    }
    (window as any).onCallback = function () {
      resolve(instance);
    };

    return loadScript(urlMap[code])
      .then(() => {
        if (code === 'amap') {
          (window as any)._AMapSecurityConfig = {
            // serviceHost:'您的代理服务器域名或地址/_AMapService',
            // 例如 ：serviceHost:'http://1.1.1.1:80/_AMapService',
            securityJsCode,
          };
        }
        resolve(true);
      })
      .catch((err) => {
        console.log('加载地图脚本失败');
        reject(err);
      });
  });
}
