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
 * @file AipImageProcess.js
 * @author baidu aip
 */

const BaseClient = require('./client/baseClient');

const RequestInfo = require('./client/requestInfo');

const HttpClient = require('./http/httpClient');

const objectTools = require('./util/objectTools');

const METHOD_POST = 'POST';

const IMAGE_QUALITY_ENHANCE_PATH = '/rest/2.0/image-process/v1/image_quality_enhance';
const DEHAZE_PATH = '/rest/2.0/image-process/v1/dehaze';
const CONTRAST_ENHANCE_PATH = '/rest/2.0/image-process/v1/contrast_enhance';
const COLOURIZE_PATH = '/rest/2.0/image-process/v1/colourize';
const STRETCH_RESTORE_PATH = '/rest/2.0/image-process/v1/stretch_restore';
const STYLE_TRANS_PATH = '/rest/2.0/image-process/v1/style_trans';
const SELFIE_ANIME_PATH = '/rest/2.0/image-process/v1/selfie_anime';


/**
 * AipImageProcess类
 *
 * @class
 * @extends BaseClient
 * @constructor
 * @param {string} appid appid.
 * @param {string} ak  access key.
 * @param {string} sk  security key.
 */
class AipImageProcess extends BaseClient {
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
     * 图像无损放大接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    imageQualityEnhance(image, options) {
        let param = {
            image: image,
            targetPath: IMAGE_QUALITY_ENHANCE_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 图像去雾接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    dehaze(image, options) {
        let param = {
            image: image,
            targetPath: DEHAZE_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 图像对比度增强接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    contrastEnhance(image, options) {
        let param = {
            image: image,
            targetPath: CONTRAST_ENHANCE_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 黑白图像上色接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    colourize(image, options) {
        let param = {
            image: image,
            targetPath: COLOURIZE_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 拉伸图像恢复接口
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    stretchRestore(image, options) {
        let param = {
            image: image,
            targetPath: STRETCH_RESTORE_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }


    /**
     * 图像风格转换
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    styleTrans(image, option, options) {
        let param = {
            image: image,
            option: option,
            targetPath: STYLE_TRANS_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }

    /**
     * 人像动漫化
     *
     * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
     * @param {Object} options - 可选参数对象，key: value都为string类型
     * @description options - options列表:
     * @return {Promise} - 标准Promise对象
     */
    selfieAnime(image, options) {
        let param = {
            image: image,
            targetPath: SELFIE_ANIME_PATH
        };
        return this.commonImpl(objectTools.merge(param, options));
    }
}

module.exports = AipImageProcess;

