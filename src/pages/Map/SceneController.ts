import { LineLayer, PointLayer } from '@antv/l7';
import { getMapData } from './MapUtil';

class SceneController {
  scene: any;
  lineLayer: any;
  pointLayer: any;
  constructor(scene: any) {
    this.scene = scene;
  }

  //渲染线图层
  drawLayer(options: any) {
    const {
      data: childData,
      type: childType,
      color: childColor,
      shape: childShape,
      size: childSize,
    } = options;

    const mapData = getMapData(childData, 'LineString');

    let layer = null;
    layer =
      childType === 'line'
        ? new LineLayer({
            autoFit: true,
          })
        : new PointLayer({ autoFit: true });

    layer
      .source(mapData)
      .size(childSize) // shape为simple时，size 方法不生效 线宽始终为 1px
      .shape(childShape)
      .color(childColor)
      .style({
        opacity: 1,
      });

    this.scene.addLayer(layer);
  }
}
