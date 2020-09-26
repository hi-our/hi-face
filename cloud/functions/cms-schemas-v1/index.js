#!/usr/bin/env node

// 请查看部署文档，并注意建立开发和生产环境的env文件

const fs = require('fs').promises
const path = require('path')
const cloud = require('wx-server-sdk')

const cmsContentsCollection = 'tcb-ext-cms-contents'
const schemasFolder = path.resolve(__dirname, 'models')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

async function main() {
  // 检查CMS预设的集合是否存在
  const checkPromises = await Promise.all([
    'tcb-ext-cms-contents',
    'tcb-ext-cms-users',
    'tcb-ext-cms-webhooks'
  ].map(checkCollection))

  if (!checkPromises.every(item => item)) {
    console.log('请前往腾讯云·云开发控制台，在「扩展能力」中开通「内容管理」')
    return
  }

  const schemas = await fs.readdir(schemasFolder)
  for (const schema of schemas) {
    // if (schema !== 'themes.json') return
    const schemaFilePath = path.join(schemasFolder, schema)
    const stats = await fs.stat(schemaFilePath)
    if (stats.isFile() && schema.endsWith('.json')) {
      try {
        await createCollection(schemaFilePath)
      } catch (error) {
        console.log(error)
      }
    }
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
      // await cmsCollection.doc(_id)
      //   .update({
      //     _id,
      //     updateTime: new Date()
      //   })
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

exports.main = main
