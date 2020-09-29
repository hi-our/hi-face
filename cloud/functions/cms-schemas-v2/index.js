const fs = require('fs')
const path = require('path')
const cloud = require('wx-server-sdk')

const fsPromises = fs.promises

const cmsContentsCollection = 'tcb-ext-cms-schemas'
const cmsProjectsCollection = 'tcb-ext-cms-projects'
const schemasFolder = path.resolve(__dirname, 'schemas')
const projectsFolder = path.resolve(__dirname, 'projects')
const contentsFolder = path.resolve(__dirname, 'contents')
let uploadsFolderSrc = 'cloudbase-cms/upload/2020-09-26'
const uploadsFolder = path.resolve(__dirname, uploadsFolderSrc)

cloud.init({
  // env: 'web-test-faad77',
  env: cloud.DYNAMIC_CURRENT_ENV,
})
const db = cloud.database()

async function main(event) {
  const { needTypes = ['projects', 'schemas', 'uploads', 'contents'] } = event
  // 检查CMS预设的集合是否存在
  const checkPromises = await Promise.all([
    'tcb-ext-cms-schemas',
    'tcb-ext-cms-users',
    'tcb-ext-cms-webhooks'
  ].map(checkCollection))

  if (!checkPromises.every(item => item)) {
    console.log('请前往腾讯云·云开发控制台，在「扩展能力」中开通「内容管理」')
    return
  }

  // 导入 CMS v2 项目 project
  if (needTypes.includes('projects')) {
    const projects = await fsPromises.readdir(projectsFolder)
    for (const project of projects) {
      const projectFilePath = path.join(projectsFolder, project)
      const stats = await fsPromises.stat(projectFilePath)
      if (stats.isFile() && project.endsWith('.json')) {
        try {
          await addProject(projectFilePath)
        } catch (error) {
          console.log(error)
        }
      }
    }

  }

  // 导入 CMS v2 数据集合模型
  if (needTypes.includes('projects') && needTypes.includes('schemas')) {
    const schemas = await fsPromises.readdir(schemasFolder)
    for (const schema of schemas) {
      const schemaFilePath = path.join(schemasFolder, schema)
      const stats = await fsPromises.stat(schemaFilePath)
      if (stats.isFile() && schema.endsWith('.json')) {
        try {
          await createCollection(schemaFilePath)
        } catch (error) {
          console.log(error)
        }
      }
    }
  }
  

  if (needTypes.includes('uploads')) {
    const uploads = await fsPromises.readdir(uploadsFolder)
    for (const upload of uploads) {
      const uploadFilePath = path.join(uploadsFolder, upload)
      const stats = await fsPromises.stat(uploadFilePath)
      if (stats.isFile()) {
        try {
          await uploadFile(path.join(uploadsFolderSrc, upload), uploadFilePath)
        } catch (error) {
          console.log(error)
        }
      }
    }
  }

  // 导入 CMS v2 默认内容数据
  if (needTypes.includes('contents')) {
    const contents = await fsPromises.readdir(contentsFolder)
    for (const content of contents) {
      const contentFilePath = path.join(contentsFolder, content)
      const stats = await fsPromises.stat(contentFilePath)
      if (stats.isFile() && content.endsWith('.json')) {
        try {
          let collectionName = content.replace('.json', '')
          await addContent(collectionName, contentFilePath)
        } catch (error) {
          console.log(error)
        }
      }
    }
  }
}

/**
 * 更新CMS结构记录，创建数据表
 * @param {string} filepath
 */
async function addProject(filepath) {
  const dataJson = require(filepath)
  const cmsCollection = db.collection(cmsProjectsCollection)

  console.log(`>>> start create ${dataJson.name}`)
  try {
    
    const { total } = await cmsCollection.where({
      customId: dataJson.customId
    })
      .count()
    
  
    if (total === 0) {
      // 按照 CMS 的字段定义格式，新建对应字段的记录信息
      const { _id } = await cmsCollection.add({
        data: {
          ...dataJson,
          createTime: new Date(),
          updateTime: new Date(),
        }
      })
      console.log(`<<< ${dataJson.name} create success`)
    } else {
      console.log(`<<< ${dataJson.name} exists`)
    }
  } catch (error) {
    console.log('error :>> ', error)
  }

}
/**
 * 更新CMS结构记录，创建数据表
 * @param {string} filepath
 */
async function createCollection(filepath) {
  const schemaJson = require(filepath)
  const cmsCollection = db.collection(cmsContentsCollection)

  console.log(`>>> start create ${schemaJson.collectionName}`)
  try {
    
    const { total } = await cmsCollection.where({
      collectionName: schemaJson.collectionName
    })
      .count()
    
  
    if (total === 0) {
      // 按照 CMS 的字段定义格式，新建对应字段的记录信息
      const { _id } = await cmsCollection.add({
        data: {
          ...schemaJson,
          createTime: new Date(),
          updateTime: new Date(),
        }
      })
      const isExists = await checkCollection(schemaJson.collectionName)
      if (!isExists) {
        await db.createCollection(schemaJson.collectionName)
      }
  
      console.log(`<<< ${schemaJson.collectionName} create success`)
    } else {
      console.log(`<<< ${schemaJson.collectionName} exists`)
    }
  } catch (error) {
    console.log('error :>> ', error)
  }

}

/**
 * 检查集合是否存在
 * @param {string} collectionName
 * @return {Promise<boolean>}
 */
async function checkCollection(collectionName) {
  try {
    await db.collection(collectionName).count()
    return true
  } catch (error) {
    if (error.errMsg.includes('Db or Table not exist')) {
      return false
    }
    console.log('checkCollection error :>> ', error)
    throw error
  }
}

async function uploadFile(cloudPath, filePath) {
  try {
    const res = await cloud.uploadFile({
      // 云存储的路径
      cloudPath,
      fileContent: fs.createReadStream(filePath)
    })
    // 返回文件 ID
    console.log('res.fileID', res.fileID)
  } catch (error) {
    console.log('uploadFile error :>> ', error)
    throw error
  }
}

async function addContent(collectionName, filepath) {
  const contentCollection = db.collection(collectionName)
  try {
    const contentJSON = require(filepath)
    const isExists = await checkCollection(collectionName)
    if (isExists) {
      const { total } = await contentCollection.where({
        _id: contentJSON._id
      })
        .count()
      if (total === 0) {
        // 新增默认数据
        const { _id } = await contentCollection.add({
          data: contentJSON
        })
        console.log(collectionName + ' add content success _id :>> ', _id)
      } else {
        console.log(collectionName + ' _id ' + contentJSON._id + ' exists',)
      }
    } else {
      console.log(collectionName + ' not exist')
    }
  } catch (error) {
    console.log('addContent error:>> ', error)
    throw error
  }
}

exports.main = main
