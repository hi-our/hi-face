import Taro, { useState, useEffect, useRef } from '@tarojs/taro';
import { genderBad } from './gender'
import  RenderPop from './components/list-model'
import { FlyModal } from './components/fly-modal'
import { View, Button, Image } from '@tarojs/components'
import { isIphoneSafeArea } from 'utils/common';
import { COUNT_INIT_STATE } from './status'
import { MAP_LITE } from './map-lite';

import './styles.styl'

const isIphoneX = isIphoneSafeArea()

const guideImg = 'https://n1image.hjfile.cn/res7/2020/02/12/56dac2e61f9485e8b5e59de473c41fd7.png'

const getMapList = (count) => {
  let mapList = []
  count.forEach((col, index) => {
    col.forEach((val, index2) => {
      let mapIndex = index * 50 + index2
      mapList[mapIndex] = Object.assign({}, {
        status: val.name
      }, MAP_LITE[mapIndex])
    })
  })

  return mapList
}

export default class SpreadGame extends Taro.Component {

  config = {
    navigationBarTitleText: '病毒演化模拟器',
  }

  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    return {
      title: '让我们快快戴口罩，抗击疫情吧！',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/wear-a-mask/wear-a-mask'
    }
  }

  renderPlane = (props) => {
    const { day, config } = props
    const { row, col, percent, mask } = config

    return (
      <View>
        <View className="app-p">时间：{day} 目</View>
        <View className="app-p">世界地图：{row * col} 点</View>
        <View className="app-p">传染概率：{percent} %</View>
        <View className="app-p">个体普及戴口罩：{mask ? '有' : '无'}</View>
      </View>
    )
  }
  render() {
    const [day, setDay] = useState(0);
    const [config, setConfig] = useState(Object.assign({}, COUNT_INIT_STATE))

    // 声明一个叫 "count" 的 state 变量
    const [count, setCount] = useState(genderBad({
      config,
      setConfig
    }));
    const [guide, setGuide] = useState(true)
    const [history, setHistory] = useState({
      visible: false,
      content: []
    })

    let mapList = getMapList(count)

    const savedCallback = useRef();
    const [start, setStart] = useState(false);

    // 演变
    useEffect(() => {
      savedCallback.current = (id) => {
        if (config.allBad >= config.row * config.col) {
          console.log('清除定时器')
          setStart(false)
          clearInterval(id);
          const saveItem = Taro.getStorageSync('saveItem') || []
          saveItem.unshift({
            day: day + 1,
            count,
            config,
            key: Math.floor(100000000 * Math.random())
          })
          Taro.setStorageSync('saveItem', saveItem)
        }
        // 遍历每个人，根据演变规则演变
        count.forEach(col => {
          col.forEach(val => {
            val.change()
            val.run()
          })
        })
        setCount([...count])
        let allBad = 0
        count.flat(5).forEach(val => {
          if (val.name === 'bad')
            allBad++
        }, 0)
        // config.allBad = start
        setConfig({
          ...config,
          allBad: allBad
        })
        setDay(day + 1)
      }
    }, [config, count, day]);

    useEffect(() => {
      if (!start) { return }
      console.log('开启定时器')
      const id = setInterval(tick, 1000 / config.speed)
      tick()
      function tick() {
        savedCallback.current(id);
      }
      return () => {
        if (savedCallback.current) {
          clearInterval(id);
        }
      }
    }, [config.speed, start])

    function clickStart() {
      console.log('start')
      setDay(0)
      setCount(genderBad({
        config,
        setConfig
      }))
      setConfig({
        ...config,
        allBad: 1
      })
      setStart(true)
    }

    function clickHistory(setHistory2) {
      const saveItem = Taro.getStorageSync('saveItem') || []

      setHistory2({
        content: saveItem,
        visible: true
      })
    }


    return (
      <View>
        <View className="app-view">
          {/* <View className="app-h3">病毒演化模拟器</View> */}
          {this.renderPlane({
            count,
            config,
            setConfig,
            day
          })}
          <View className='btn-wrap'>
            <Button className='bottom-btn' onClick={() => clickHistory(setHistory)}>查看历史数据</Button>
            <Button type="primary" disabled={start} onClick={() => setConfig({
              ...config,
              showPop: true
            })}
            >
              设置演变属性
          </Button>
          </View>
          <View className='map-wrap'>
            {
              mapList.map((one) => {
                let oneStyle= {
                  left: one.l * 2 + 'rpx',
                  top: (138 - one.t) * 3 + 'rpx'
                }
                
                let className = 'map-dot'
                if (one.cn) {
                  className += ' map-dot-china'
                }
                if (one.status) {
                  className += ' ' + one.status
                }
                return <View key={one.l + one.r + one.l * one.r} className={className} style={oneStyle}></View>
              })
            }

          </View>
          <RenderPop
            count={count}
            config={config}
            setConfig={setConfig}
          />
          <FlyModal
            title='历史数据'
            visible={history.visible}
            setVisible={() => {
              setHistory({
                ...history,
                visible: false
              })
            }}
          >
            {
              history.content.filter(item => !!item).map((val) => {

                return (
                  <View key={val.key}>
                    飞机管制{val.config.fly ? '关' : '开'}，
                    高铁管制{val.config.travel ? '关' : '开'}，
                    高速管制{val.config.way ? '关' : '开'}，
                    个体{val.config.mask ? '普及' : '未普及'}戴口罩,
                    人员聚集{val.config.gather ? '管制' : '未管制'}，
                    自我隔离百分比：{val.config.home * 10} %,
                    耗时{val.day}目
                  </View>
                )
              })
            }
          </FlyModal>
          <FlyModal
            title=''
            visible={guide}
            setVisible={() => {
              setGuide(false)
            }}
          >
            <Image src={guideImg} alt='' className='guide-img'  />
          </FlyModal>
          <View className='app-p'>本应用数据非实际数据，仅作演示用途</View>

          <Button type={start ? 'warn' : 'primary'} className={`history ${isIphoneX ? 'ip-x' : ''}`} disabled={start} onClick={() => clickStart()}>{start ? '正在演变' : '开始演变'}</Button>
        </View>
      </View>
    )
  }
}