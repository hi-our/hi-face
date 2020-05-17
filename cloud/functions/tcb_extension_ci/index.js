'use strict';
const tcb = require('tcb-admin-node')
const getAuth = require('./util').getAuth

function parsePath(key,pic){
    if(pic.indexOf('/')===0){
        return pic
    }else{
        let idx = key.lastIndexOf('/')
        if(idx===-1){
            return pic
        }else{
            return key.slice(0,idx+1)+pic
        }
    }
}

exports.main = async (event, context, callback) => {
    tcb.init({
        env:tcb.getCurrentEnv()
    });

    const { headers, method, query, key, action } = event

    let fileList = []
    fileList.push({
        path:key,
        type:(method === 'GET' || method === 'POST') ? 'READ' : 'WRITE'
    })

    const TcbStorageBucket = process.env.TcbStorageBucket
    const TcbStorageRegion = process.env.TcbStorageRegion

    const token = tcb.config.sessionToken

    let picIds = []
    if(headers && headers['Pic-Operations']){
        let rules
        let picOperations
        try{
          picOperations = JSON.parse(headers['Pic-Operations'])
          rules = picOperations.rules
        }catch(err){}
        if(rules){
            picIds = rules.map(rule=>rule.fileid).filter(id=>!!id)
            for(let pic of picIds){
                fileList.push({
                    path:parsePath(key,pic),
                    type:'WRITE'
                })
            }
            for(let rule of rules){
                if(rule.rule && rule.rule.indexOf('watermark')===0 && rule.rule.indexOf('/image/')!==-1 && action==='WaterMark'){
                    let idx = rule.rule.indexOf('/image/')+7
                    let imagePath = rule.rule.slice(idx)
                    fileList.push({
                        path:imagePath,
                        type:'READ'
                    })
                    const imageAuthorization = getAuth({
                        SecretId: tcb.config.secretId,
                        SecretKey: tcb.config.secretKey,
                        Method: 'GET',
                        Headers:  null,
                        Query :  null,
                        Key: imagePath
                    })
                    const imageUrl = `http://${TcbStorageBucket}.cos.${TcbStorageRegion}.myqcloud.com/${imagePath}?${imageAuthorization}&x-cos-security-token=${token}`
                    rule.rule = rule.rule.slice(0,idx) + `${Buffer.from(imageUrl).toString('base64').replace(/\//g,'_').replace(/=/g,'').replace(/\+/g,'-')}`
                }
            }
            headers['Pic-Operations'] = JSON.stringify(picOperations)
        }
    }

    
    const url = `https://${TcbStorageBucket}.pic.${TcbStorageRegion}.myqcloud.com/${key}`
    
    // const userInfo = tcb.auth().getUserInfo()
    // const {openId, uid} = userInfo
  
    const tcbSource = process.env.TCB_SOURCE || ''
    let needCheckAuthority = true
    if(tcbSource.indexOf(',scf')>-1 || tcbSource.indexOf(',not_scf')>-1){
        needCheckAuthority = false
    }
    if(needCheckAuthority){
        const authorityRes = await tcb.getFileAuthority({fileList})
        const { data } = authorityRes
        if(data.some(file=>{
            if('read' in file && !file['read']){
                return true
            }
            if('write' in file && !file['write']){
                return true
            }
            return false
        })){
            return {
                code:'STORAGE_EXCEED_AUTHORITY',
                message:'不具备访问权限'
            }
        }
    }
    

    let authorization = getAuth({
        SecretId: tcb.config.secretId,
        SecretKey: tcb.config.secretKey,
        Method: method,
        Headers: headers || null,
        Query : query || null,
        Key: key
    })

    let res =  {
        code : 0,
        headers,
        authorization,
        token,
        url
    }
    

    return res
};
