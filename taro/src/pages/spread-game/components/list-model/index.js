import Taro, { useState } from '@tarojs/taro';
import { View, Image, Icon, Switch, Block, Slider } from '@tarojs/components';
import FlyModal from '../fly-modal'
import { COUNT_INIT_STATE } from '../../status';
import './styles.styl'

const maskImg = 'https://n1image.hjfile.cn/res7/2020/02/12/e7e70f8d3c2588d38754f1b510107a2e.jpg'
const flyImg = 'https://n1image.hjfile.cn/res7/2020/02/12/282f8e02b471ebd770292eefb9a23a08.jpg'
const travleImg = 'https://n1image.hjfile.cn/res7/2020/02/12/b3def398373e6130d6d1d3c2c7eca13d.jpg'
const wayImg = 'https://n1image.hjfile.cn/res7/2020/02/12/927ea084f0a192c833e8ba48a22dbb98.jpeg'
const gatherImg = 'https://n1image.hjfile.cn/res7/2020/02/12/f9a5b430fde569699e78765c4a738ee7.jpeg'
const homeImg = 'https://n1image.hjfile.cn/res7/2020/02/12/daeb1409dd1c557c40ca9740fce5b31b.jpeg'

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
      <Block>
        <FlyModal
          className='pop-dialog'
          visible={config.showPop}
          title='演变属性'
          position='bottom'
          setVisible={() => {
            setConfig({
              ...config,
              showPop: false
            })
          }}
        >

          <View>
            <View className='list-item'>
              <View className='item_click' onClick={() => {
                setModalVisible({
                  ...modalVisible,
                  fly: true
                })
              }}>飞机管制<Icon type='info' size='15'></Icon></View>
              <Switch
                checked={!config.fly}
                onChange={(ev) => {
                  setConfig({
                    ...config,
                    fly: !ev.detail.value
                  })
                }}
              />
            </View>
            <View className='list-item'>
              <View className='item_click' onClick={() => {
                setModalVisible({
                  ...modalVisible,
                  travel: true
                })
              }}>高铁管制<Icon type='info' size='15'></Icon></View>
              <Switch
                checked={!config.travel}
                onChange={(ev) => {
                  setConfig({
                    ...config,
                    travel: !ev.detail.value
                  })
                }}
              />
            </View>
            <View className='list-item'>
              <View className='item_click' onClick={() => {
                setModalVisible({
                  ...modalVisible,
                  way: true
                })
              }}>高速管制<Icon type='info' size='15'></Icon></View>
              <Switch
                checked={!config.way}
                onChange={(ev) => {
                  setConfig({
                    ...config,
                    way: !ev.detail.value
                  })
                }}
              />
            </View>
            <View className='list-item'>
              <View className='item_click' onClick={() => {
                setModalVisible({
                  ...modalVisible,
                  mask: true
                })
              }}>个体普及戴口罩<Icon type='info' size='15'></Icon></View>
              <Switch
                checked={config.mask}
                onChange={(ev) => {
                  console.log('ev.detail.value :', ev.detail.value);
                  const percent = ev.detail.value ? config.percent - 2 : config.percent + 2
                  setConfig({
                    ...config,
                    mask: ev.detail.value,
                    percent
                  })
                }}
              />
            </View>
            <View className='list-item'>
              <View className='item_click' onClick={() => {
                setModalVisible({
                  ...modalVisible,
                  gather: true
                })
              }}>人员聚集管制<Icon type='info' size='15'></Icon></View>
              <Switch
                checked={config.gather}
                onChange={(ev) => {
                  const percent = ev.detail.value ? config.percent - 2 : config.percent + 2
                  setConfig({
                    ...config,
                    gather: ev.detail.value,
                    percent
                  })
                }}
              />
            </View>
            <View className='list-item'>
              <View className='item_click'>演化速度</View>
              <View className='list-item-right'>
                <Slider onChange={(ev) => {
                  console.log('ev.detail.value :', ev.detail.value);
                    setConfig({
                      ...config,
                      speed: ev.detail.value
                    })
                }} min="1" max="10" value={config.speed} showValue
                />
              </View>

            </View>
          </View>
        </FlyModal>
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
            <View class='app-br'> </View>
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
            <View class='app-br'> </View>
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
            <View class='app-br'> </View>
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
            <View class='app-br'> </View>
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
            <View class='app-br'> </View>
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
            <View class='app-br'> </View>
            <Image src={homeImg} alt='' />
          </View>
        </FlyModal>
      
      </Block>
    )
  }
}



