import Taro, { useState, useEffect, useRef } from '@tarojs/taro';
import { genderBad } from './gender'
import  RenderPop from './components/list-model'
import { FlyModel } from './components/fly-modal'
import guideImg from '../../images/spread-6.png'
import { View, Button, Image } from '@tarojs/components'


import './styles.styl'

export default class SpreadGame extends Taro.Component {

  renderPlane = (props) => {
    return (
      <View>
        <View>时间：{props.day} 目</View>
        <View>个体数：{props.config.row * props.config.col} 人</View>
        <View>传染概率：{props.config.percent} %</View>
        {/* <p>飞机管制：{props.config.fly ? '无' : '有'}</p>
      <p>高铁管制：{props.config.travel ? '无' : '有'}</p>
      <p>高速管制：{props.config.way ? '无' : '有'}</p> */}
      </View>
    )
  }
  render() {
    const [day, setDay] = useState(0);
    const [config, setConfig] = useState({
      row: 50,
      col: 50,
      //感染概率 2 - 10
      percent: 10,
      runPercent: 10,
      allBad: 1,
      fly: true,
      // 飞机距离为 50
      flyDir: 50,
      travel: true,
      // 高铁距离为 10
      highTravelDir: 10,
      way: true,
      // 口罩
      mask: false,
      // 聚集
      gather: false,
      // 在家自我隔离
      home: 0,
      // 高速路距离为 5
      highWayDir: 5,
      showPop: false,
      speed: 3
    })

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


    const divEle = count.map((col, index) => {
      const person = col.map((val, index2) => {
        const key = `${index}-${index2}`
        const className = val.healthy ? 'person' : `person ${val.name}`
        return <View className={className} key={key}></View>
      })
      return <View className='split' key={index}>{person}</View>
    })
    const savedCallback = useRef();
    const [start, setStart] = useState(false);

    // 演变
    useEffect(() => {
      savedCallback.current = (id) => {
        if (config.allBad >= config.row * config.col) {
          console.log('清除定时器')
          setStart(false)
          clearInterval(id);
          const saveItem = localStorage.saveItem ? JSON.parse(localStorage.saveItem) : []
          saveItem.length = 5
          saveItem.unshift({
            day: day + 1,
            count,
            config
          })
          localStorage.saveItem = JSON.stringify(saveItem)
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
      const saveItem = localStorage.saveItem ? JSON.parse(localStorage.saveItem) : []
      setHistory2({
        content: saveItem,
        visible: true
      })
      console.log(saveItem)
    }
    
    



    return (
      <View>
        <View className="App-View">
          <Button type="primary" onClick={() => clickHistory(setHistory)}>查看历史数据</Button>
          <Button className='bottom-btn' disabled={start} onClick={() => setConfig({
            ...config,
            showPop: true
          })}
          >
            设置演变属性
          </Button>
          <View>病毒演化模拟器</View>
          {this.renderPlane({
            count,
            config,
            setConfig,
            day
          })}
          <View>
            {divEle}
          </View>
          <RenderPop
            count={count}
            config={config}
            setConfig={setConfig}
          />
          {/* {
            FlyModel({
              title: '历史数据',
              visible: history.visible,
              setVisible: () => {
                setHistory({
                  ...history,
                  visible: false
                })
              },
              content: history.content.map((val, index) => {
                if (!val) return ''
                return (<View key={index}>
                  飞机管制{val.config.fly ? '关' : '开'}，
                高铁管制{val.config.travel ? '关' : '开'}，
                高速管制{val.config.way ? '关' : '开'}，
                个体{val.config.mask ? '普及' : '未普及'}戴口罩,
                人员聚集{val.config.gather ? '管制' : '未管制'}，
                自我隔离百分比：{val.config.home * 10} %,
                耗时{val.day}目</View>)
              })
            })
          }
          {
            FlyModel({
              title: '',
              visible: guide,
              setVisible: () => {
                setGuide(false)
              },
              content: (<Image src={guideImg} alt='' style={{ width: '100%' }} />)
            })
          } */}
          <View>本应用数据非实际数据，只做娱乐用途</View>

          <Button type="primary" className='history' disabled={start} onClick={() => clickStart()}>{start ? '正在演变' : '开始演变'}</Button>
        </View>
      </View>
    )
  }
}