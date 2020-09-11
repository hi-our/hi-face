#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')
const dotenv = require('dotenv')
const tcb = require('@cloudbase/node-sdk')

const cmsContentsCollection = 'tcb-ext-cms-contents'
const envFile = path.resolve(__dirname, '..', '.env')
const schemasFolder = path.resolve(__dirname, 'models')

const config = dotenv.config({ path: envFile }).parsed

const app = tcb.init({
  secretId: config.TCB_SECRET_ID,
  secretKey: config.TCB_SECRET_KEY,
  env: config.ENV_ID
})
const db = app.database()

main()

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

  const { total } = await cmsCollection.where({
    collectionName: schemaJson.collectionName
  })
    .count()

  if (total === 0) {
    // 按照 CMS 的字段定义格式，新建对应字段的记录信息
    const { id } = await cmsCollection.add({
      ...schemaJson,
      createTime: new Date(),
      updateTime: new Date(),
    })
    await cmsCollection.doc(id)
      .update({
        id,
        updateTime: new Date()
      })

    const isExists = await checkCollection(schemaJson.collectionName)
    if (!isExists) {
      await db.createCollection(schemaJson.collectionName)
    }

    console.log(`<<< ${schemaJson.collectionName} create success`)
  } else {
    console.log(`<<< ${schemaJson.collectionName} exists`)
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
    if (error.code === 'DATABASE_COLLECTION_NOT_EXIST') {
      return false
    }
    throw error
  }
}