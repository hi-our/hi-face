'use strict';
/**
 * Copyright (c) 2017 Baidu.com, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 * @file AipImageClassify.js
 * @author baidu aip
 */

const BaseClient = require('./client/baseClient');

const RequestInfo = require('./client/requestInfo');

const HttpClient = require('./http/httpClient');

const objectTools = require('./util/objectTools');

const METHOD_POST = 'POST';

const ADVANCED_GENERAL_PATH = '/rest/2.0/image-classify/v2/advanced_general';
const DISH_DETECT_PATH = '/rest/2.0/image-classify/v2/dish';
const CAR_DETECT_PATH = '/rest/2.0/image-classify/v1/car';
const VEHICLE_DETECT_PATH = '/rest/2.0/image-classify/v1/vehicle_detect';
const VEHICLE_DAMAGE_PATH = '/rest/2.0/image-classify/v1/vehicle_damage';
const LOGO_SEARCH_PATH = '/rest/2.0/image-classify/v2/logo';
const LOGO_ADD_PATH = '/rest/2.0/realtime_search/v1/logo/add';
const LOGO_DELETE_PATH = '/rest/2.0/realtime_search/v1/logo/delete';
const ANIMAL_DETECT_PATH = '/rest/2.0/image-classify/v1/animal';
const PLANT_DETECT_PATH = '/rest/2.0/image-classify/v1/plant';
const OBJECT_DETECT_PATH = '/rest/2.0/image-classify/v1/object_detect';
const LANDMARK_PATH = '/rest/2.0/image-classify/v1/landmark';
const FLOWER_PATH = '/rest/2.0/image-classify/v1/flower';
const INGREDIENT_PATH = '/rest/2.0/image-classify/v1/classify/ingredient';
const REDWINE_PATH = '/rest/2.0/image-classify/v1/redwine';
const CURRENCY_PATH = '/rest/2.0/image-classify/v1/currency';


/**
 * AipImageClassify类
 *
 * @class
 * @extends BaseClient
 * @constructor
 * @param {string} appid appid.
 * @param {string} ak  access key.
 * @param {string} sk  security key.
 */
class AipImageClassify extends BaseClient {
    constructor(appId, ak, sk) {
        super(appId, ak, sk);
    }
    commonImpl(param) {
        let httpClient = new HttpClient();
        let apiUrl = param.targetPath;
        delete param.targetPath;
        let requestInfo = new RequestInfo(apiUrl,
            param, METHOD_POST);
        return this.doRequest(requestInfo, httpClient);
    }

    /**
     * 通用物体识别接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     *   baike_num 返回百科信息的结果数，默认不返回
     * @return {Promise} - 标准Promise对象
     */
    advancedGeneral(image, options) {
        let param = {
            image: image,
            targetPath: ADVANCED_GENERAL_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 菜品识别接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     *   top_num 返回预测得分top结果数，默认为5
     *   filter_threshold 默认0.95，可以通过该参数调节识别效果，降低非菜识别率.
     *   baike_num 返回百科信息的结果数，默认不返回
     * @return {Promise} - 标准Promise对象
     */
    dishDetect(image, options) {
        let param = {
            image: image,
            targetPath: DISH_DETECT_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 车辆识别接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     *   top_num 返回预测得分top结果数，默认为5
     *   baike_num 返回百科信息的结果数，默认不返回
     * @return {Promise} - 标准Promise对象
     */
    carDetect(image, options) {
        let param = {
            image: image,
            targetPath: CAR_DETECT_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 车辆检测接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     *   show 是否返回结果图（含统计值和跟踪框）。选true时返回渲染后的图片(base64)，其它无效值或为空则默认false。
     *   area 只统计该区域内的车辆数，缺省时为全图统计。<br>逗号分隔，如‘x1,y1,x2,y2,x3,y3...xn,yn'，按顺序依次给出每个顶点的x、y坐标（默认尾点和首点相连），形成闭合多边形区域。<br>服务会做范围（顶点左边需在图像范围内）及个数校验（数组长度必须为偶数，且大于3个顶点）。只支持单个多边形区域，建议设置矩形框，即4个顶点。**坐标取值不能超过图像宽度和高度，比如1280的宽度，坐标值最大到1279**。
     * @return {Promise} - 标准Promise对象
     */
    vehicleDetect(image, options) {
        let param = {
            image: image,
            targetPath: VEHICLE_DETECT_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 车辆外观损伤识别接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    vehicleDamage(image, options) {
        let param = {
            image: image,
            targetPath: VEHICLE_DAMAGE_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * logo商标识别接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     *   custom_lib 是否只使用自定义logo库的结果，默认false：返回自定义库+默认库的识别结果
     * @return {Promise} - 标准Promise对象
     */
    logoSearch(image, options) {
        let param = {
            image: image,
            targetPath: LOGO_SEARCH_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * logo商标识别—添加接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {string} brief - brief，检索时带回。此处要传对应的name与code字段，name长度小于100B，code长度小于150B
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    logoAdd(image, brief, options) {
        let param = {
            image: image,
            brief: brief,
            targetPath: LOGO_ADD_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * logo商标识别—删除接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    logoDeleteByImage(image, options) {
        let param = {
            image: image,
            targetPath: LOGO_DELETE_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * logo商标识别—删除接口
     *
     * @param {string} contSign - 图片签名（和image二选一，image优先级更高）
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    logoDeleteBySign(contSign, options) {
        let param = {
            cont_sign: contSign,
            targetPath: LOGO_DELETE_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 动物识别接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     *   top_num 返回预测得分top结果数，默认为6
     *   baike_num 返回百科信息的结果数，默认不返回
     * @return {Promise} - 标准Promise对象
     */
    animalDetect(image, options) {
        let param = {
            image: image,
            targetPath: ANIMAL_DETECT_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 植物识别接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     *   baike_num 返回百科信息的结果数，默认不返回
     * @return {Promise} - 标准Promise对象
     */
    plantDetect(image, options) {
        let param = {
            image: image,
            targetPath: PLANT_DETECT_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 图像主体检测接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     *   with_face 如果检测主体是人，主体区域是否带上人脸部分，0-不带人脸区域，其他-带人脸区域，裁剪类需求推荐带人脸，检索/识别类需求推荐不带人脸。默认取1，带人脸。
     * @return {Promise} - 标准Promise对象
     */
    objectDetect(image, options) {
        let param = {
            image: image,
            targetPath: OBJECT_DETECT_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 地标识别接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    landmark(image, options) {
        let param = {
            image: image,
            targetPath: LANDMARK_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 花卉识别接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     *   top_num 返回预测得分top结果数，默认为5
     *   baike_num 返回百科信息的结果数，默认不返回
     * @return {Promise} - 标准Promise对象
     */
    flower(image, options) {
        let param = {
            image: image,
            targetPath: FLOWER_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 食材识别接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     *   top_num 返回预测得分top结果数，如果为空或小于等于0默认为5；如果大于20默认20
     * @return {Promise} - 标准Promise对象
     */
    ingredient(image, options) {
        let param = {
            image: image,
            targetPath: INGREDIENT_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 红酒识别接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    redwine(image, options) {
        let param = {
            image: image,
            targetPath: REDWINE_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 货币识别接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    currency(image, options) {
        let param = {
            image: image,
            targetPath: CURRENCY_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }
}

module.exports = AipImageClassify;

