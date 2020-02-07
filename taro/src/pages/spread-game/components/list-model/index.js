import Taro, { useState, useEffect, useRef } from '@tarojs/taro';
import { View, Image, Icon, Switch } from '@tarojs/components';
import maskImg from '../../../../images/spread-1.jpg'
import flyImg from '../../../../images/spread-2.jpg'
import travleImg from '../../../../images/spread-3.jpg'
import wayImg from '../../../../images/spread-3.jpeg'
import gatherImg from '../../../../images/spread-4.jpeg'
import homeImg from '../../../../images/spread-5.jpeg'

import FlyModal from '../fly-modal'
import { COUNT_INIT_STATE } from '../../status';
import './styles.styl'

export default class RenderPop extends Taro.Component {

  static defaultProps = {
    config: Object.assign({}, COUNT_INIT_STATE),
    setConfig: () => {}
    
  }

  render() {

    const { config = {}, setConfig } = this.props
    const [modalVisible, setModalVisible] = useState({
      fly: false,
      travel: false,
      way: false,
      mask: false,
      gather: false
    })

    return (
      <View
        className='pop-dialog'
        popup
        style={{ display: config.showPop ? 'block' : 'none', width: '90%' }}
        onClose={() => {
          setConfig({
            ...config,
            showPop: false
          })
        }}
        animationType="slide-up"
      >
        <FlyModal
          title='飞机管制'
          visible={modalVisible.fly}
          setVisible={() => {
            setModalVisible({
              ...modalVisible,
              fly: false
            })
          }}
        >
          <View>
            <View>飞机管制关：个体可乘坐飞机，随机与 相邻 50 坐标内的个体发生交换。</View>
            <View> </View>
            <View>飞机管制开：禁止个体乘坐飞机</View>
            <Image src={flyImg} alt='' />
          </View>
        </FlyModal>
        <FlyModal
          title='高铁管制'
          visible={modalVisible.travel}
          setVisible={() => {
            setModalVisible({
              ...modalVisible,
              travel: false
            })
          }}
        >
          <View>
            <View>高铁管制关：个体可乘坐高铁，随机与 相邻 10 坐标内的个体发生交换。</View>
            <View> </View>
            <View>高铁管制开：禁止个体乘坐高铁</View>
            <Image src={travleImg} alt='' />
          </View>
        </FlyModal>
        <FlyModal
          title='高速管制'
          visible={modalVisible.way}
          setVisible={() => {
            setModalVisible({
              ...modalVisible,
              way: false
            })
          }}
        >
          <View>
            <View>高速管制关：个体可自驾高速，随机与 相邻 5 坐标内的个体发生交换。</View>
            <View> </View>
            <View>高速管制开：禁止个体自驾高速</View>
            <Image src={wayImg} alt='' />
          </View>
        </FlyModal>
        <FlyModal
          title='普及带口罩'
          visible={modalVisible.mask}
          setVisible={() => {
            setModalVisible({
              ...modalVisible,
              mask: false
            })
          }}
        >
          <View>
            <View>开启可减少个体间传染概率</View>
            <View> </View>
            <Image src={maskImg} alt='' />
          </View>
        </FlyModal>
        <FlyModal
          title='人员聚集管制'
          visible={modalVisible.gather}
          setVisible={() => {
            setModalVisible({
              ...modalVisible,
              gather: false
            })
          }}
        >
          <View>
            <View>开启即禁止人员聚集类活动，减少传染概率</View>
            <View> </View>
            <Image src={gatherImg} alt='' />
          </View>
        </FlyModal>
        <FlyModal
          title='自我隔离占比'
          visible={modalVisible.home}
          setVisible={() => {
            setModalVisible({
              ...modalVisible,
              home: false
            })
          }}
        >
          <View>
            <View>自我隔离占比，即个体与其他个体间自觉隔离，个体无被感染可能</View>
            <View> </View>
            <Image src={homeImg} alt='' />
          </View>
        </FlyModal>
        <View>
          <View>演变属性</View>
          <View>
            <Switch
              checked={!config.fly}
              onChange={(ev) => {
                setConfig({
                  ...config,
                  fly: !ev
                })
              }}
            />
            <View className='item_click' onClick={() => {
              setModalVisible({
                ...modalVisible,
                fly: true
              })
            }}>飞机管制<Icon type='right'></Icon></View>
          </View>
          <View>
            <Switch
              checked={!config.travel}
              onChange={(ev) => {
                setConfig({
                  ...config,
                  travel: !ev
                })
              }}
            />
            <View className='item_click' onClick={() => {
              setModalVisible({
                ...modalVisible,
                travel: true
              })
            }}>高铁管制<Icon type='right'></Icon></View>
          </View>
          <View>
            <Switch
              checked={!config.way}
              onChange={(ev) => {
                setConfig({
                  ...config,
                  way: !ev
                })
              }}
            />
            <View className='item_click' onClick={() => {
              setModalVisible({
                ...modalVisible,
                way: true
              })
            }}>高速管制<Icon type='right'></Icon></View>
          </View>
          <View>
            <Switch
              checked={config.mask}
              onChange={(ev) => {
                const percent = ev ? config.percent - 2 : config.percent + 2
                setConfig({
                  ...config,
                  mask: ev,
                  percent
                })
              }}
            />
            <View className='item_click' onClick={() => {
              setModalVisible({
                ...modalVisible,
                mask: true
              })
            }}>个体普及戴口罩<Icon type='right'></Icon></View>
          </View>
          <View>
            <Switch
              checked={config.gather}
              onChange={(ev) => {
                const percent = ev ? config.percent - 2 : config.percent + 2
                setConfig({
                  ...config,
                  gather: ev,
                  percent
                })
              }}
            />
            <View className='item_click' onClick={() => {
              setModalVisible({
                ...modalVisible,
                gather: true
              })
            }}>人员聚集管制<Icon type='right'></Icon></View>
          </View>
        </View>
      </View>
    )
  }
}



