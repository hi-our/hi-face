// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const { themeId } = event

  try {
    const { errMsg, data } = await db.collection('themes').doc(themeId).get()
    console.log('result :>> ', data);
    let themeData = data

    if (errMsg === 'document.get:ok') {
      let { errMsg: categoryErrMsg, list: shapeCategoryList } = await db.collection('shape_categories').aggregate()
        .match({
          belongThemes: themeId
        })
        .lookup({
          from: 'shapes',
          localField: '_id',
          foreignField: 'belongShapeCategory',
          as: 'shapeList'
        })
        .end()
      if (categoryErrMsg === 'collection.aggregate:ok') {
        themeData.shapeCategoryList = shapeCategoryList
      }

      return {
        data: themeData,
        status: 0,
        message: '',
        time: new Date()
      }
    }
    
  } catch (error) {
    const { errCode, errMsg } = error
    return {
      data: '',
      status: errCode || -20000,
      message: errCode ? errMsg : JSON.stringify(error),
      time: new Date()
    }
  }
}
