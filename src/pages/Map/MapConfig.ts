export type IGeometryType = 'Point' | 'LineString';
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

export const MapTypeDefault = 'gaode';

export const MapTypeList: LabelValue[] = [
  {
    label: '高德地图',
    value: 'gaode',
    key: '9115b18d7c8cf97033f0b4f1faa7a259',
    securityJsCode: '85b2147dae78f171665334625793a1b1',
    version: '2.0'
  },
  {
    label: '百度地图',
    value: 'baidu',
    key: 'c3PVwY44PeR2imjoHfIN9p9GWBXRnJFm',
    securityJsCode: '',
    version: '1.0'
  }
];

export const MapKeyConfig: any = Object.fromEntries(
  MapTypeList.map((item) => [item.value, item])
);

export const MapConfig: any = {
  token: MapKeyConfig[MapTypeDefault].value,
  center: [116.39135328, 39.90750659],
  zoom: 10, // 初始化缩放等级，Mapbox （0-24） 高德 （2-19）
  rotation: 0, // 旋转角度
  pitch: 20 // 地图倾角
  // mapStyle: 'amap://styles/blue'
};

export const MapLayerConfig = {
  size: 10,
  shape: 'simple',
  color: '#f00'
};

export const GeometryTypeMap: Record<string, IGeometryType> = {
  line: 'LineString',
  point: 'Point'
};
