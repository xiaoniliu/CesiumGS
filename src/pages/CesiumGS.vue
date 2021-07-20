<template>
  <div>
    <button class="edit-btn" @click="draw">绘图</button>
    <div id="cesiumContainer"></div>
  </div>
</template>

<script>
import * as Cesium from 'cesium/Cesium'
import 'cesium/Widgets/widgets.css'

export default {
  name: 'CesiumGS',
  data () {
    return {
      viewer: undefined,
      pointCoordinates: [],
      pointCartesian3: []
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      const viewer = new Cesium.Viewer('cesiumContainer')
      this.viewer = viewer
      viewer.scene.globe.depthTestAgainstTerrain = true
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(116.2, 39.56, 1500.0),
        orientation: {
          heading: Cesium.Math.toRadians(90, 0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0.0
        }
      })
    },
    setListener () {
      this.viewer.screenSpaceEventHandler.setInputAction((movement) => {
        const cartesian3 = this.viewer.scene.pickPosition(movement.endPosition)
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian3)
        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        const lng = Cesium.Math.toDegrees(cartographic.longitude)
        const _pointCoordinates = [...this.pointCoordinates]
        const _pointCartesian3 = [...this.pointCartesian3]
        if (_pointCoordinates.length) {
          const pointObject = { lng, lat, isClick: false }
          const lastPoint = _pointCoordinates[_pointCoordinates.length - 1]
          if (lastPoint.isClick) {
            // doubleClick会触发此方法，传递经纬度一样的点位，此处需要过滤
            if (lng !== lastPoint.lng && lat !== lastPoint.lat) {
              _pointCoordinates.push(pointObject)
              _pointCartesian3.push(cartesian3)
            }
          } else {
            _pointCoordinates[_pointCoordinates.length - 1] = pointObject
            _pointCartesian3[_pointCoordinates.length - 1] = cartesian3
          }
          this.pointCartesian3 = _pointCartesian3
          this.pointCoordinates = _pointCoordinates
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      this.viewer.screenSpaceEventHandler.setInputAction((movement) => {
        const cartesian3 = this.viewer.scene.pickPosition(movement.position)
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian3)
        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        const lng = Cesium.Math.toDegrees(cartographic.longitude)
        const _pointCoordinates = [...this.pointCoordinates]
        const _pointCartesian3 = [...this.pointCartesian3]
        if (!_pointCoordinates.length) {
          _pointCoordinates.push({ lng, lat, isClick: true })
          _pointCartesian3.push(cartesian3)
          this.drawPolygon(new Cesium.CallbackProperty((time, result) => {
            return new Cesium.PolygonHierarchy(this.pointCartesian3)
          }, false))
        } else {
          const pointObject = { lng, lat, isClick: true }
          _pointCoordinates[_pointCoordinates.length - 1] = pointObject
          _pointCartesian3[_pointCoordinates.length - 1] = cartesian3
        }
        this.pointCartesian3 = _pointCartesian3
        this.pointCoordinates = _pointCoordinates
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      this.viewer.screenSpaceEventHandler.setInputAction(() => {
        const _pointCoordinates = [...this.pointCoordinates]
        const _pointCartesian3 = [...this.pointCartesian3]

        // 至少有三个完整的click点才算是一个完整的图形
        if (_pointCoordinates.length > 3) {
          const lastPoint = _pointCoordinates[_pointCoordinates.length - 1]
          if (!lastPoint.isClick) {
            _pointCoordinates.pop()
            _pointCartesian3.pop()
          }
          this.pointCartesian3 = _pointCartesian3
          this.pointCoordinates = _pointCoordinates
          this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
          this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
          this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    },

    draw () {
      this.setListener()
    },

    drawPolygon (hierarchy) {
      this.viewer.entities.add({
        polygon: {
          hierarchy,
          outline: true,
          // 边框颜色
          outlineColor: Cesium.Color.fromCssColorString('rgba(2,114,255)'),
          // 填充的颜色，withAlpha透明度
          material: Cesium.Color.fromCssColorString('rgba(2,114,255,0.5)'),
          // 是否被提供的材质填充
          fill: true,
          // 恒定高度
          height: 1,
          // 是否显示
          show: true,
          // 顺序,仅当`clampToGround`为true并且支持地形上的折线时才有效。
          zIndex: 10
        }
      })
    }
  },
  watch: {

  }
}
</script>

<style scoped>
.edit-btn{
  position: absolute;
  z-index: 999;
  top: 20px;
  left: 20px;
}
</style>
