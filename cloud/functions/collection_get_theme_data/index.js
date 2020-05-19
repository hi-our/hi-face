// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

const getImageUrl = async (fileID) => {
  const { fileList } = await cloud.getTempFileURL({
    fileList: [fileID]
  })
  return fileList[0].tempFileURL
}


// 云函数入口函数
exports.main = async (event, context) => {
  let { themeId } = event

  try {

    if (!themeId) {
      let configRes = await cloud.callFunction({
        name: 'collection_get_configs',
        data: {
          configName: 'avatar-edit'
        }
      })

      let result = configRes.result.data
      themeId = result.themeId
    }

    if (!themeId) {
      return {
        data: '',
        status: -20001,
        message: '未成功设置themeID',
        time: new Date()
      }
    }

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
        // TODO 临时写法，快速换地址
        let cloudId = shapeCategoryList[0].shapeList[0].imageFileID
        let couldPrefix = cloudId.split('/uploads/')[0]
        let urlPath = await getImageUrl(cloudId)
        let urlPrefix = urlPath.split('/uploads/')[0]

        shapeCategoryList.forEach(catItem => {
          catItem.shapeList.forEach(shapeItem => {
            const { imageFileID, imageReverseFileID } = shapeItem
            if (imageFileID) shapeItem.imageUrl = imageFileID.replace(couldPrefix, urlPrefix)
            if (imageReverseFileID) shapeItem.imageReverseUrl = imageReverseFileID.replace(couldPrefix, urlPrefix)
          })
        })
        
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
