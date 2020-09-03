const BaseController = require('./base-controller.js')
const ConfigController = require('./config')

const COLLECTION_NAME = 'themes'
const apiConfig = new ConfigController()

const getImageUrl = async (cloud, fileID) => {
  const { fileList } = await cloud.getTempFileURL({
    fileList: [fileID]
  })
  return fileList[0].tempFileURL
}

class ThemeController extends BaseController {
  async get(event) {
    let { themeId, needShapes } = event

    try {

      if (!themeId) {
        let { data } = await apiConfig.get({
          configName: 'avatar-edit'
        })
        console.log('result :>> ', data);
        themeId = data.themeId
      }

      if (!themeId) {
        return this.fail(-20001, '未成功设置themeID')
      }

      const { errMsg, data } = await this.cloud.db.collection('themes').doc(themeId).get()
      console.log('result :>> ', data);
      let themeData = data

      if (needShapes && errMsg === 'document.get:ok') {
        let { errMsg: categoryErrMsg, list: shapeCategoryList } = await this.cloud.db.collection('shape_categories').aggregate()
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
        if (categoryErrMsg === 'collection.aggregate:ok' && shapeCategoryList.length > 0) {
          // TODO 临时写法，快速换地址
          let cloudId = shapeCategoryList[0].shapeList[0].imageFileID
          let couldPrefix = cloudId.split('/uploads/')[0]
          let urlPath = await getImageUrl(this.cloud, cloudId)
          let urlPrefix = urlPath.split('/uploads/')[0]
          console.log('urlPrefix :>> ', couldPrefix, urlPrefix);

          shapeCategoryList.forEach(catItem => {
            catItem.shapeList.forEach(shapeItem => {
              const { imageFileID, imageReverseFileID } = shapeItem
              if (imageFileID) shapeItem.imageUrl = imageFileID.replace(couldPrefix, urlPrefix)
              if (imageReverseFileID) shapeItem.imageReverseUrl = imageReverseFileID.replace(couldPrefix, urlPrefix)
            })
          })

          themeData.shapeCategoryList = shapeCategoryList
        }

      }
      return this.success(themeData)

    } catch (error) {
      console.log('error :>> ', error);
      const { errCode, errMsg } = error
      return this.fail(errCode || -20000, errCode ? errMsg : JSON.stringify(error))
    }
  }

  async list(event) {
    /**
     * page: 第几页
     * num: 每页几条数据
     * condition： 查询条件，例如 { name: '李白' }
     */
    const { pageNo = 1, pageSize = 10, condition = {}, orderBy = {} } = event

    try {
      let { total } = await this.cloud.db.collection(COLLECTION_NAME).count()
      let pageTotal = Math.ceil(total / pageSize)

      if (pageNo > pageTotal) {
        this.success({
          items: [],
          pageNo,
          total
        })
      }

      let operation = this.cloud.db.collection(COLLECTION_NAME)
        .where({
          isPublic: true,
          ...condition
        })
        .skip(pageSize * (pageNo - 1))
        .limit(pageSize)

      if (orderBy.field) {
        operation = operation.orderBy(orderBy.field, orderBy.orderType || 'desc')
      } else {
        operation = operation.orderBy('order', 'asc')
      }
      let { data = [] } = await operation.get()

      console.log('theme list data :>> ', data);
      if (data && data.length >= 1) {
        return this.success({
          items: data,
          nextPage: pageTotal > pageNo,
          pageNo,
          total
        })
      }

      return this.fail(-10000, '数据不存在')

    } catch (err) {
      console.log(err)
      return this.fail(-10001, '数据不存在', err)
    }
  }
}

module.exports = ThemeController
