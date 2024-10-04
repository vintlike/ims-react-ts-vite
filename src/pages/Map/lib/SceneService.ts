import {
  BaiduMap,
  GaodeMap,
  LineLayer,
  Marker,
  MarkerLayer,
  PointLayer,
  PolygonLayer,
  Scene,
} from '@antv/l7';
import {
  GeometryTypeMap,
  IMapConfigProps,
  IMapType,
  MapConfig,
  MapKeyConfig,
  MapLayerConfig,
} from '../MapConfig';
import { getMapData, showLnglatInfo } from '../MapUtil';

export const SceneLayerMap: Record<string, any> = {
  line: LineLayer,
  point: PointLayer,
  polygon: PolygonLayer,
};

class SceneService {
  mapType: IMapType;
  mapRef: any;
  MapInstance: any;
  scene: any;

  mapOptions: IMapConfigProps;
  isBmap?: boolean;

  markerList: any;
  lnglatList: any;

  pointLayer: any;
  lineLayer: any;
  polygonLayer: any;
  markerLayer: any;
  marker: any;
  geocoder: any;

  constructor(
    mapType: IMapType,
    mapRef: any,
    options: Partial<IMapConfigProps>,
    map: any,
  ) {
    this.mapType = mapType;
    this.mapRef = mapRef;
    this.MapInstance = map;
    this.mapOptions = { ...MapConfig, ...options };
    this.isBmap = mapType === 'bmap';

    this.markerList = [];
    this.lnglatList = [];

    this.pointLayer = null;
    this.lineLayer = null;
    this.polygonLayer = null;
    this.markerLayer = null;
    this.marker = null;
    this.geocoder = null;

    this.init();
  }

  init() {
    let mapObjOptions: any = {
      token: MapKeyConfig[this.mapType].key,
      style: MapKeyConfig[this.mapType].style,
      ...this.mapOptions,
    };

    // 百度的是BMapGL，高德的是AMap
    // if (this.mapType !== 'amap') {
    //   const map = new this.MapInstance.Map(this.mapRef, this.mapOptions);
    //   const point = new this.MapInstance.Point(
    //     MapConfig.center[0],
    //     MapConfig.center[1],
    //   );
    //   if (this.isBmap) {
    //     // 百度地图需要执行centerAndZoom进行初始化
    //     map.centerAndZoom(point, MapConfig.zoom);
    //     // 默认滚轮缩放禁用，需要如下执行开启
    //     map.enableScrollWheelZoom();
    //   }
    //   mapObjOptions = {
    //     mapInstance: map, // 外部传入实例化，百度地图要重新设置中心点，另外高德地图如果使用此种方式控制台偶尔会报错
    //   };
    // }

    const mapObj = this.isBmap
      ? new BaiduMap(mapObjOptions)
      : new GaodeMap(mapObjOptions);

    this.scene = new Scene({
      id: this.mapRef,
      logoVisible: false,
      map: mapObj,
    });

    //地图监听鼠标点击
    this.scene.on('click', (e: any) => {
      this.mapClickEmitter(e);
    });

    this.markerLayer = new MarkerLayer({});
    this.marker = new Marker({
      color: '#415fff',
      offsets: [0, -5],
    });

    this.geocoder = new this.MapInstance.Geocoder({
      radius: 3000, //范围，默认：500
      city: '全国', //城市设为北京，默认：“全国”
    });
  }

  /**
   * 重置并移除图层
   */
  resetLayer() {
    this.scene.removeAllLayer();

    //移除图层
    // if (this.pointLayer) {
    //   this.scene.removeLayer(this.pointLayer);
    // }

    // if (this.lineLayer) {
    //   this.scene.removeLayer(this.lineLayer);
    // }

    // if (this.polygonLayer) {
    //   this.scene.removeLayer(this.polygonLayer);
    // }

    // 移除标点
    if (this.markerList?.length > 0) {
      this.markerLayer.clear();
    }

    this.markerList = [];
    this.lnglatList = [];
  }

  /**
   * 地图点击事件handler
   */
  mapClickEmitter(e: any) {
    this.resetLayer();
    this.drawMarker(e.lnglat || e.lngLat);
  }

  /**
   * 渲染标记
   * @param lnglat
   */
  drawMarker(lnglat: any) {
    // 获取鼠标当前点的坐标
    const { lng, lat } = lnglat;

    this.scene.addMarkerLayer(this.markerLayer);

    //设置marker的坐标
    this.marker.setLnglat({ lng, lat });
    //将marker添加的地图中
    this.scene.addMarker(this.marker);
    //将当前坐标存放到坐标数组，用于后续渲染lineLayer和pointLayer
    this.lnglatList.push([lng, lat]);

    //将当前marker存放到marker数组，后续用于遍历移除
    this.markerList.push(this.marker);
    this.markerLayer.addMarker(this.marker);

    // 设置地图缩放范围，调整到最佳视角
    this.scene.fitBounds([
      [lng, lat],
      [lng, lat],
    ]);
  }

  /**
   * 渲染线图层
   * @param options
   */
  drawLayer(options: any) {
    const { shape, size, color, pointSize, pointShape, style } = MapLayerConfig;
    const {
      data: childData,
      type: childType,
      color: childColor,
      shape: childShape,
      size: childSize,
    } = options;

    const isPointType = childType === 'point';

    const LayerEntity = SceneLayerMap[childType];

    const mapData = getMapData(
      isPointType ? childData[0] : childData,
      GeometryTypeMap[childType],
    );

    if (childData.length) {
      if (childType === 'point') {
        this.pointLayer = new LayerEntity({ autoFit: true })
          .source(mapData)
          .size(childSize ?? pointSize)
          .shape(childShape ?? pointShape)
          .color(childColor ?? color)
          .style(style);

        this.scene.addLayer(this.pointLayer);
        showLnglatInfo(this.scene, this.pointLayer);
      } else if (childType === 'line') {
        this.lineLayer = new LayerEntity({ autoFit: true })
          .source(mapData)
          .size(childSize ?? size)
          .shape(childShape ?? shape)
          .color(childColor ?? color)
          .style(style);

        this.scene.addLayer(this.lineLayer);
        showLnglatInfo(this.scene, this.lineLayer);
      } else if (childType === 'polygon') {
        this.polygonLayer = new PolygonLayer({ autoFit: true })
          .source(mapData)
          .size(childSize ?? size)
          .shape(childShape ?? shape)
          .color(childColor ?? color)
          .style(style)
          .active(true);

        this.scene.addLayer(this.polygonLayer);
        showLnglatInfo(this.scene, this.polygonLayer);
      }
    }
  }

  /**
   * 地理编码（地址->坐标）
   */
  geoCode(address: string, callback: (value: number[]) => void) {
    const errMsg = `${this.mapType}：根据地址查询位置失败`;
    if (!address?.trim()) {
      return console.error('请输入地址');
    }

    if (this.isBmap) {
      this.geocoder.getPoint(address, (point: any) => {
        if (point) {
          this.drawMarker(point);

          const lnglat: number[] = Object.values(point);
          callback(lnglat);
        } else {
          console.error(errMsg);
        }
      });
    } else {
      this.geocoder.getLocation(address, (status: any, result: any) => {
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
          const { lng, lat } = lnglat;

          this.drawMarker({ lng, lat });

          callback(lnglat);
        } else {
          console.error(errMsg);
        }
      });
    }
  }

  /**
   * 逆地理编码（坐标->地址）
   */
  regeoCode(lnglat: number[], callback: (value: string) => void) {
    const errMsg = `${this.mapType}:根据经纬度查询地址失败`;
    const [lng, lat] = lnglat;

    if (lnglat.length === 0) {
      return console.error('输入或点击地图获取经纬度');
    }

    this.drawMarker({ lng, lat });

    if (this.isBmap) {
      // 创建点坐标
      const point = new this.MapInstance.Point(Number(lng), Number(lat));

      this.geocoder.getLocation(point, (result: any) => {
        if (result) {
          const address = result.address;

          callback(address);
        } else {
          console.error(errMsg);
        }
      });
    } else {
      this.geocoder.getAddress(lnglat, function (status: any, result: any) {
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

          callback(address);
        } else {
          console.error(errMsg);
        }
      });
    }
  }
}

export default SceneService;
