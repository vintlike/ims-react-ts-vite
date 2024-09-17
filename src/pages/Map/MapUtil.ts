import { log } from 'console';
import { MapKeyConfig } from './MapConfig';
import gcoord from 'gcoord';

export const lnglatSwitch = (value: string, mapType: string) => {
  if (!value) {
    return;
  }

  const [lng, lat] = value.split(/\s*,\s*|_|\s+/) ?? [];

  let result = [Number(lng), Number(lat)];

  if (mapType === 'baidu') {
    result = gcoord.transform(
      result as any, // 经纬度坐标
      gcoord.WGS84, // 当前坐标系
      gcoord.BD09 // 目标坐标系
    );
  } else if (mapType === 'gaode') {
    // 将WGS84坐标转换为GCJ02坐标
    result = gcoord.transform(
      result as any, // 经纬度坐标
      gcoord.WGS84, // 当前坐标系
      gcoord.GCJ02 // 目标坐标系
    );
  }

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
    return;
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
      hasLat ? (isUnderscore ? regUnderscore : regBlank) : regComma
    );

    const result = lnglatSwitch(`${lng},${lat}`, mapType);
    if (result) {
      val.push(result);
    }
  });

  return val;
};

export function loadMapScript(code: string): Promise<any> {
  const { key, securityJsCode, version } = MapKeyConfig[code];
  return new Promise<any>((resolve, reject) => {
    const instance = window.BMapGL;
    if (typeof instance !== 'undefined') {
      resolve(instance);
      return;
    }
    (window as any).onCallback = function () {
      resolve(instance);
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    if (code === 'baidu') {
      script.src = `https://api.map.baidu.com/api?v=${version}&type=webgl&ak=${key}&callback=onCallback`;
    } else {
      (window as any)._AMapSecurityConfig = {
        // serviceHost:'您的代理服务器域名或地址/_AMapService',
        // 例如 ：serviceHost:'http://1.1.1.1:80/_AMapService',
        securityJsCode
      };
      script.src = `https://webapi.amap.com/maps?v=${version}&key=${key}&callback=onCallback`;
    }
    script.onerror = reject;
    document.body.appendChild(script);
  });
}
