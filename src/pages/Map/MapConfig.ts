import { load as AMapLoader } from '@amap/amap-jsapi-loader';
import { loader as BMapLoader } from 'bmap-jsapi-loader';

export type IGeometryType = 'Point' | 'LineString' | 'Polygon';
export interface IFeatureItemProps {
  type: string;
  properties: {
    [key: string]: any;
  };
  geometry: {
    type: IGeometryType;
    coordinates: number[];
  };
}

export interface IFeatureCollectionProps {
  type: string;
  features: IFeatureItemProps[];
}

export interface IMapSceneProps {
  data: any[];
  type?: string;
  size?: number;
  shape?: string;
  color?: string;
  style?: any;
}

export interface IMapHandles {}

export interface IMapConfigProps {
  token?: string; // 根据不同地图服务加载不同的token
  center: [number, number];
  zoom?: number; // 初始化缩放等级，Mapbox （0-24） 高德 （2-19） 百度 （3-19）
  minZoom?: number;
  maxZoom?: number;
  rotation?: number; // 旋转角度
  pitch?: number; // 地图倾角
  style?: string;
}

export type IMapType = 'amap' | 'bmap';

export const MapTypeDefault = 'amap';

export const MapTypeList: LabelValue<IMapType>[] = [
  {
    label: '高德地图',
    value: 'amap',
    key: '9115b18d7c8cf97033f0b4f1faa7a259',
    securityJsCode: '85b2147dae78f171665334625793a1b1',
    version: '2.0',
    style: 'normal',
  },
  {
    label: '百度地图',
    value: 'bmap',
    key: 'c3PVwY44PeR2imjoHfIN9p9GWBXRnJFm',
    securityJsCode: '',
    version: '1.0',
    style: 'dark',
    type: 'webgl',
  },
];

export const MapKeyConfig: any = Object.fromEntries(
  MapTypeList.map((item) => [item.value, item]),
);

export const MapConfig: IMapConfigProps = {
  // style: MapKeyConfig[MapTypeDefault].style, // 根据不同地图加载不同的样式
  // token: MapKeyConfig[MapTypeDefault].key, // 根据不同地图服务加载不同的token
  center: [116.39135328, 39.90750659],
  zoom: 10, // 初始化缩放等级，Mapbox （0-24） 高德 （2-19） 百度 （3-19）
  minZoom: 3,
  maxZoom: 19,
  rotation: 2, // 旋转角度
  pitch: 0, // 地图倾角
};

export const MapLayerConfig = {
  size: 2,
  pointSize: 8,
  pointShape: 'simple',
  wallSize: 20,
  shape: 'line',
  color: '#f00',
  style: {},
};

export const GeometryTypeMap: Record<string, IGeometryType> = {
  line: 'LineString',
  wall: 'LineString',
  point: 'Point',
  polygon: 'Polygon',
};

export { AMapLoader, BMapLoader };
