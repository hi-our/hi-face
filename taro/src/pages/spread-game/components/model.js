import Taro, { useState, useEffect, useRef } from '@tarojs/taro';
import { View, Image, Icon } from '@tarojs/components';
import maskImg from '../../../images/spread-1.jpg'
import flyImg from '../../../images/spread-2.jpg'
import travleImg from '../../../images/spread-3.jpg'
import wayImg from '../../../images/spread-3.jpeg'
import gatherImg from '../../../images/spread-4.jpeg'
import homeImg from '../../../images/spread-5.jpeg'

import FlyModel from './fly-model'

export default class RenderPop extends Taro.Component {
  render() {

    const { config, setConfig } = this.props
    const [modalVisible, setModalVisible] = useState({
      fly: false,
      travel: false,
      way: false,
      mask: false,
      gather: false
    })

    return (
      <View
        popup
        visible={config.showPop}
        onClose={() => {
          setConfig({
            ...config,
            showPop: false
          })
        }}
        animationType="slide-up"
      >
        {
          FlyModel({
            title: '飞机管制',
            visible: modalVisible.fly,
            setVisible: () => {
              setModalVisible({
                ...modalVisible,
                fly: false
              })
            },
            content: (
              <View>
                <View>飞机管制关：个体可乘坐飞机，随机与 相邻 50 坐标内的个体发生交换。</View>
                <View> </View>
                <View>飞机管制开：禁止个体乘坐飞机</View>
                <Image src={flyImg} alt='' />
              </View>
            )
          })
        }
        {
          FlyModel({
            title: '高铁管制',
            visible: modalVisible.travel,
            setVisible: () => {
              setModalVisible({
                ...modalVisible,
                travel: false
              })
            },
            content: (
              <View>
                <View>高铁管制关：个体可乘坐高铁，随机与 相邻 10 坐标内的个体发生交换。</View>
                <View> </View>
                <View>高铁管制开：禁止个体乘坐高铁</View>
                <Image src={travleImg} alt='' />
              </View>
            )
          })
        }
        {
          FlyModel({
            title: '高速管制',
            visible: modalVisible.way,
            setVisible: () => {
              setModalVisible({
                ...modalVisible,
                way: false
              })
            },
            content: (
              <View>
                <View>高速管制关：个体可自驾高速，随机与 相邻 5 坐标内的个体发生交换。</View>
                <View> </View>
                <View>高速管制开：禁止个体自驾高速</View>
                <Image src={wayImg} alt='' />
              </View>
            )
          })
        }
        {
          FlyModel({
            title: '普及带口罩',
            visible: modalVisible.mask,
            setVisible: () => {
              setModalVisible({
                ...modalVisible,
                mask: false
              })
            },
            content: (
              <View>
                <View>开启可减少个体间传染概率</View>
                <View> </View>
                <Image src={maskImg} alt='' />
              </View>
            )
          })
        }
        {
          FlyModel({
            title: '人员聚集管制',
            visible: modalVisible.gather,
            setVisible: () => {
              setModalVisible({
                ...modalVisible,
                gather: false
              })
            },
            content: (
              <View>
                <View>开启即禁止人员聚集类活动，减少传染概率</View>
                <View> </View>
                <Image src={gatherImg} alt='' />
              </View>
            )
          })
        }
        {
          FlyModel({
            title: '自我隔离占比',
            visible: modalVisible.home,
            setVisible: () => {
              setModalVisible({
                ...modalVisible,
                home: false
              })
            },
            content: (
              <View>
                <View>自我隔离占比，即个体与其他个体间自觉隔离，个体无被感染可能</View>
                <View> </View>
                <Image src={homeImg} alt='' />
              </View>
            )
          })
        }
        <View
          renderHeader={() => '演变属性'}
        >
          <View
            extra={<Switch
              checked={!config.fly}
              onChange={(ev) => {
                setConfig({
                  ...config,
                  fly: !ev
                })
              }}
            />}
          >
            <View className='item_click' onClick={() => {
              setModalVisible({
                ...modalVisible,
                fly: true
              })
            }}>
              飞机管制<Icon type='right'></Icon>
            </View>
          </View>
          <View
            extra={<Switch
              checked={!config.travel}
              onChange={(ev) => {
                setConfig({
                  ...config,
                  travel: !ev
                })
              }}
            />}
          >
            <View className='item_click' onClick={() => {
              setModalVisible({
                ...modalVisible,
                travel: true
              })
            }}>
              高铁管制<Icon type='right'></Icon>
            </View>
          </View>
          <View
            extra={<Switch
              checked={!config.way}
              onChange={(ev) => {
                setConfig({
                  ...config,
                  way: !ev
                })
              }}
            />}
          >
            <View className='item_click' onClick={() => {
              setModalVisible({
                ...modalVisible,
                way: true
              })
            }}>
              高速管制<Icon type='right'></Icon>
            </View>
          </View>
          <View
            extra={<Switch
              checked={config.mask}
              onChange={(ev) => {
                const percent = ev ? config.percent - 2 : config.percent + 2
                setConfig({
                  ...config,
                  mask: ev,
                  percent
                })
              }}
            />}
          >
            <View className='item_click' onClick={() => {
              setModalVisible({
                ...modalVisible,
                mask: true
              })
            }}>
              个体普及戴口罩<Icon type='right'></Icon>
            </View>
          </View>
          <View
            extra={<Switch
              checked={config.gather}
              onChange={(ev) => {
                const percent = ev ? config.percent - 2 : config.percent + 2
                setConfig({
                  ...config,
                  gather: ev,
                  percent
                })
              }}
            />}
          >
            <View className='item_click' onClick={() => {
              setModalVisible({
                ...modalVisible,
                gather: true
              })
            }}>
              人员聚集管制<Icon type='right'></Icon>
            </View>
          </View>
          {/* <InputItem type="number"
              placeholder="输入 0 - 9 的数字"
              min={1}
              max={100}
              defaultValue={config.home}
              onChange={(ev) => {
                setConfig({
                  ...config,
                  home: ev
                })
              }}
              style={{
                textAlign: 'right'
              }}
            >
            <View className='item_click' onClick={() => {
          setModalVisible({
            ...modalVisible,
            home: true
          })
        }}>自我隔离占百分比<Icon type='right'></Icon></View>
        </InputItem> */}
            {/* <View
              wrap
              extra={
                <Stepper
                  style={{ width: '100%', minWidth: '100px' }}
                  showNumber
                  max={10}
                  min={1}
                  value={config.speed}
                  onChange={(ev) => {
                    setConfig({
                      ...config,
                      speed: ev
                    })
                  }}
                />}
            >
              演化速度
          </View> */}

          
        </View>
      </View>
    )
  }
}



