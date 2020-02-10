import lodashGet from 'lodash/get'

// export const config = {
//   row: 50,
//   col: 50,
//   //感染概率 2 - 10
//   percent: 10,
//   runPercent: 10,
//   allBad: 1,
//   //演化速度
//   speed: 60,
//   fly: false,
//   // 飞机距离为 50
//   flyDir: 50,
//   travel: false,
//   // 高铁距离为 10
//   highTravelDir: 10,
//   way: false,
//   // 高速路距离为 5
//   highWayDir: 5
// }
// 计算交换位置

function calculChangeSet(arr, obj, methods, config) {
  const dir = config[methods]
  const startJ = obj.j - dir
  const endJ = obj.j + dir - startJ
  const startI = obj.i - dir 
  const endI = obj.i + dir - startI
  const j = Math.floor(Math.random() * endJ) + startJ
  const i = Math.floor(Math.random() * endI) + startI
  const nowSet = lodashGet(arr, `[${j}][${i}]`);
  // 可以交换
  if(nowSet) {
    arr[j][i] = arr[obj.j][obj.i]
    arr[obj.j][obj.i] = nowSet
  }
}
export function genderBad(props) {
  const arr = []
  for(let j = 0; j < props.config.row; j++) {
    arr[j] = []
    for(let i = 0;i< props.config.col;i++) {
      const inHome = Math.floor(Math.random() * 10) < props.config.home
      arr[j][i] = {
        name: 'good',
        healthy: true,
        time: 0,
        j,
        i,
        inHome,
        // 逃跑
        run: function() {
          if(this.inHome) {return}
          const isRun = Math.floor(Math.random() * 100) >= 100 - props.config.runPercent
          const runType = Math.floor(Math.random() * 3)
          const methods = ['fly', 'highTravel', 'highWay']
          const canRun = ['fly', 'travel', 'way']
          // 要跑
          if(!this.healthy && isRun && props.config[canRun[runType]]) {
            this[methods[runType]]()
          }
        },
        // 乘坐飞机 距离为 100
        fly: function() {
          // 逃跑几率 20%
          // const isRun = Math.floor(Math.random() * 100) >= 100 - props.config.percent
          if(!this.healthy) {
            calculChangeSet(arr, this, 'flyDir', props.config)
          }
        },
        // 乘坐高铁
        highTravel: function() {
          // 逃跑几率 20%
          // const isRun = Math.floor(Math.random() * 100) >= 100 - props.config.percent
          if(!this.healthy) {
            calculChangeSet(arr, this, 'highTravelDir', props.config)
          }
        },
        // 高速路
        highWay: function() {
          // 交换位置
          // 逃跑几率 20%
          // const isRun = Math.floor(Math.random() * 100) >= 100 - props.config.percent
          if(!this.healthy) {
            calculChangeSet(arr, this, 'highWayDir', props.config)
          }
        },
        change: function() {
          // 在家就不会被感染
          if(!this.healthy && !this.inHome) {
            if(this.time > 7 && this.name!== 'bad') {
              this.name = 'bad'
            }
            this.time++
            // console.log(`I AM BAD ${this.time} days`)
            const matrix = [
              [j-1, i-1], [j-1, i], [j-1, i+1],
              [j, i-1], [j, i+1],
              [j+1, i-1], [j+1, i], [j+1, i+1]
            ]
            matrix.map(val => {
              const nowObj = lodashGet(arr, `[${val[0]}][${val[1]}]`);
              if(nowObj) {
                // const nowObj = arr[val[0]][val[1]]
                // 感染几率 20%
                const isHurt = Math.floor(Math.random() * 100) >= 100 - props.config.percent
                // 健康者感染了
                if(nowObj.healthy && isHurt && !nowObj.inHome) {
                  arr[val[0]][val[1]] = {
                    ...nowObj,
                    name: 'light',
                    healthy: false
                  }
                }
              }
              return false
            })
          }
        }
      }
    }
  }
  arr[20][25].healthy = false
  arr[20][25].inHome = false
  return arr
}