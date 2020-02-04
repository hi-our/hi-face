'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var config = {
    services: {
        'facefusion': {
            url: 'facefusion.tencentcloudapi.com'
        },
        'faceid': {
            url: 'faceid.tencentcloudapi.com'
        },
        'iai': {
            url: 'iai.tencentcloudapi.com'
        },
        'ocr': {
            url: 'ocr.tencentcloudapi.com'
        }
    }
};

var tencentcloud = require('tencentcloud-sdk-nodejs');
var Credential = tencentcloud.common.Credential;
var ClientProfile = tencentcloud.common.ClientProfile;
var HttpProfile = tencentcloud.common.HttpProfile;
var BaseService = (function () {
    function BaseService(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.SecretID, SecretID = _c === void 0 ? null : _c, _d = _b.SecretKey, SecretKey = _d === void 0 ? null : _d;
        var _e = process.env, SECRETID = _e.SECRETID, SECRETKEY = _e.SECRETKEY, TENCENTCLOUD_SECRETID = _e.TENCENTCLOUD_SECRETID, TENCENTCLOUD_SECRETKEY = _e.TENCENTCLOUD_SECRETKEY;
        this.SecretID = SecretID || TENCENTCLOUD_SECRETID || SECRETID;
        this.SecretKey = SecretKey || TENCENTCLOUD_SECRETKEY || SECRETKEY;
    }
    BaseService.prototype.setProxy = function (proxy) {
        this.Proxy = proxy || null;
        return this;
    };
    BaseService.prototype.init = function (_a) {
        var _b = _a.action, action = _b === void 0 ? '' : _b, _c = _a.data, data = _c === void 0 ? {} : _c, _d = _a.options, options = _d === void 0 ? {} : _d;
        if (!action) {
            throw new Error('action should not be empty.');
        }
        if (!this[action]) {
            throw new Error('action cannot be found.');
        }
        return this[action](data, options);
    };
    BaseService.prototype.request = function (_a) {
        var service = _a.service, action = _a.action, version = _a.version, data = _a.data, options = _a.options, _b = _a.endpoint, endpoint = _b === void 0 ? null : _b;
        var Client = tencentcloud[service][version].Client;
        var Models = tencentcloud[service][version].Models;
        var cred = new Credential(this.SecretID, this.SecretKey);
        var httpProfile = new HttpProfile();
        httpProfile.endpoint = endpoint || config.services[service].url;
        var clientProfile = new ClientProfile();
        clientProfile.httpProfile = httpProfile;
        var client = new Client(cred, options.region || 'ap-shanghai', clientProfile);
        var req = new Models[action + "Request"]();
        var reqParams = JSON.stringify(__assign({}, data));
        req.from_json_string(reqParams);
        return new Promise(function (resolve, reject) {
            client[action](req, function (errMsg, response) {
                if (errMsg) {
                    reject(errMsg);
                    return;
                }
                resolve(response.to_json_string());
            });
        });
    };
    BaseService.prototype.FaceFusion = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'facefusion',
            action: 'FaceFusion',
            version: 'v20181201',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.GetActionSequence = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'faceid',
            action: 'GetActionSequence',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.GetLiveCode = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'faceid',
            action: 'GetLiveCode',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.IdCardVerification = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'faceid',
            action: 'IdCardVerification',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.ImageRecognition = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'faceid',
            action: 'ImageRecognition',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.LivenessCompare = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'faceid',
            action: 'LivenessCompare',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.LivenessRecognition = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'faceid',
            action: 'LivenessRecognition',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.DetectFace = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'DetectFace',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.AnalyzeFace = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'AnalyzeFace',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.CompareFace = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'CompareFace',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.CreateGroup = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'CreateGroup',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.DeleteGroup = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'DeleteGroup',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.GetGroupList = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'GetGroupList',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.ModifyGroup = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'ModifyGroup',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.CreatePerson = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'CreatePerson',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.DeletePerson = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'DeletePerson',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.DeletePersonFromGroup = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'DeletePersonFromGroup',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.GetPersonList = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'GetPersonList',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.GetPersonListNum = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'GetPersonListNum',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.GetPersonBaseInfo = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'GetPersonBaseInfo',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.GetPersonGroupInfo = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'GetPersonGroupInfo',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.ModifyPersonBaseInfo = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'ModifyPersonBaseInfo',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.ModifyPersonGroupInfo = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'ModifyPersonGroupInfo',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.CreateFace = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'CreateFace',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.DeleteFace = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'DeleteFace',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.CopyPerson = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'CopyPerson',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.SearchFaces = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'SearchFaces',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.VerifyFace = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'VerifyFace',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.DetectLiveFace = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'iai',
            action: 'DetectLiveFace',
            version: 'v20180301',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.GeneralBasicOCR = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'ocr',
            action: 'GeneralBasicOCR',
            version: 'v20181119',
            data: data,
            options: options,
        });
    };
    BaseService.prototype.IDCardOCR = function (data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return this.request({
            service: 'ocr',
            action: 'IDCardOCR',
            version: 'v20181119',
            data: data,
            options: options,
        });
    };
    return BaseService;
}());

var Base = (function () {
    function Base(tcbService, version, action, data, options) {
        this.tcbService = tcbService;
        this.action = action;
        this.version = version;
        this.data = data;
        this.options = options;
        var ID1 = tcbService.secretID, Key1 = tcbService.secretKey;
        var ID2 = options.secretID, Key2 = options.secretKey;
        this.secretID = ID2 || ID1;
        this.secretKey = Key2 || Key1;
    }
    return Base;
}());

var AI = (function (_super) {
    __extends(AI, _super);
    function AI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AI.prototype.init = function () {
        return __awaiter(this, void 0, Promise, function () {
            var imgClient, result, data, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        imgClient = new BaseService({ SecretID: this.secretID, SecretKey: this.secretKey });
                        return [4, imgClient.init({
                                action: this.action,
                                data: this.data
                            })];
                    case 1:
                        result = _a.sent();
                        data = JSON.parse(result);
                        return [2, {
                                code: 0,
                                message: 'success',
                                data: data,
                            }];
                    case 2:
                        e_1 = _a.sent();
                        return [2, {
                                code: e_1.code,
                                message: e_1.message
                            }];
                    case 3: return [2];
                }
            });
        });
    };
    return AI;
}(Base));

var QcloudSms = require('qcloudsms_js');
var BaseService$1 = (function () {
    function BaseService(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.AppID, AppID = _c === void 0 ? null : _c, _d = _b.AppKey, AppKey = _d === void 0 ? null : _d;
        this.AppID = AppID;
        this.AppKey = AppKey;
        this.qcloudsms = QcloudSms(AppID, AppKey);
    }
    BaseService.prototype.init = function (_a) {
        var _b = _a.action, action = _b === void 0 ? '' : _b, _c = _a.data, data = _c === void 0 ? {} : _c;
        if (!action) {
            throw new Error('action should not be empty.');
        }
        if (!this[action]) {
            throw new Error('action cannot be found.');
        }
        return this[action](data);
    };
    BaseService.prototype.SmsSingleSend = function (data) {
        if (data === void 0) { data = {}; }
        var msgType = data.msgType, nationCode = data.nationCode, phoneNumber = data.phoneNumber, msg = data.msg, _a = data.extend, extend = _a === void 0 ? '' : _a, _b = data.ext, ext = _b === void 0 ? '' : _b;
        var sender = this.qcloudsms.SmsSingleSender();
        return new Promise(function (resolve, reject) {
            sender.send(msgType, nationCode, phoneNumber, msg, extend, ext, function (err, res, resData) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData: resData,
                        req: res.req,
                    });
                }
            });
        });
    };
    BaseService.prototype.SmsSingleSendTemplate = function (data) {
        if (data === void 0) { data = {}; }
        var nationCode = data.nationCode, phoneNumber = data.phoneNumber, templId = data.templId, _a = data.params, params = _a === void 0 ? [] : _a, sign = data.sign, _b = data.extend, extend = _b === void 0 ? '' : _b, _c = data.ext, ext = _c === void 0 ? '' : _c;
        var sender = this.qcloudsms.SmsSingleSender();
        return new Promise(function (resolve, reject) {
            sender.sendWithParam(nationCode, phoneNumber, templId, params, sign, extend, ext, function (err, res, resData) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData: resData,
                        req: res.req,
                    });
                }
            });
        });
    };
    BaseService.prototype.SmsMultiSend = function (data) {
        if (data === void 0) { data = {}; }
        var msgType = data.msgType, nationCode = data.nationCode, _a = data.phoneNumbers, phoneNumbers = _a === void 0 ? [] : _a, msg = data.msg, _b = data.extend, extend = _b === void 0 ? '' : _b, _c = data.ext, ext = _c === void 0 ? '' : _c;
        var sender = this.qcloudsms.SmsMultiSender();
        return new Promise(function (resolve, reject) {
            sender.send(msgType, nationCode, phoneNumbers, msg, extend, ext, function (err, res, resData) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData: resData,
                        req: res.req,
                    });
                }
            });
        });
    };
    BaseService.prototype.SmsMultiSendTemplate = function (data) {
        if (data === void 0) { data = {}; }
        var nationCode = data.nationCode, _a = data.phoneNumbers, phoneNumbers = _a === void 0 ? [] : _a, templId = data.templId, _b = data.params, params = _b === void 0 ? [] : _b, sign = data.sign, _c = data.extend, extend = _c === void 0 ? '' : _c, _d = data.ext, ext = _d === void 0 ? '' : _d;
        var sender = this.qcloudsms.SmsMultiSender();
        return new Promise(function (resolve, reject) {
            sender.sendWithParam(nationCode, phoneNumbers, templId, params, sign, extend, ext, function (err, res, resData) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData: resData,
                        req: res.req,
                    });
                }
            });
        });
    };
    BaseService.prototype.CodeVoiceSend = function (data) {
        if (data === void 0) { data = {}; }
        var nationCode = data.nationCode, phoneNumber = data.phoneNumber, msg = data.msg, _a = data.playtimes, playtimes = _a === void 0 ? 2 : _a, _b = data.ext, ext = _b === void 0 ? '' : _b;
        var sender = this.qcloudsms.CodeVoiceSender();
        return new Promise(function (resolve, reject) {
            sender.send(nationCode, phoneNumber, msg, playtimes, ext, function (err, res, resData) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData: resData,
                        req: res.req,
                    });
                }
            });
        });
    };
    BaseService.prototype.PromptVoiceSend = function (data) {
        if (data === void 0) { data = {}; }
        var nationCode = data.nationCode, phoneNumber = data.phoneNumber, _a = data.prompttype, prompttype = _a === void 0 ? 2 : _a, msg = data.msg, _b = data.playtimes, playtimes = _b === void 0 ? 2 : _b, _c = data.ext, ext = _c === void 0 ? '' : _c;
        var sender = this.qcloudsms.PromptVoiceSender();
        return new Promise(function (resolve, reject) {
            sender.send(nationCode, phoneNumber, prompttype, msg, playtimes, ext, function (err, res, resData) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData: resData,
                        req: res.req,
                    });
                }
            });
        });
    };
    BaseService.prototype.SmsStatusPullCallback = function (data) {
        if (data === void 0) { data = {}; }
        var maxNum = data.maxNum;
        var puller = this.qcloudsms.SmsStatusPuller();
        return new Promise(function (resolve, reject) {
            puller.pullCallback(maxNum, function (err, res, resData) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData: resData,
                        req: res.req,
                    });
                }
            });
        });
    };
    BaseService.prototype.SmsStatusPullReply = function (data) {
        if (data === void 0) { data = {}; }
        var maxNum = data.maxNum;
        var puller = this.qcloudsms.SmsStatusPuller();
        return new Promise(function (resolve, reject) {
            puller.pullReply(maxNum, function (err, res, resData) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData: resData,
                        req: res.req,
                    });
                }
            });
        });
    };
    BaseService.prototype.SmsMobileStatusPullCallback = function (data) {
        if (data === void 0) { data = {}; }
        var nationCode = data.nationCode, phoneNumber = data.phoneNumber, beginTime = data.beginTime, endTime = data.endTime, maxNum = data.maxNum;
        var puller = this.qcloudsms.SmsMobileStatusPuller();
        return new Promise(function (resolve, reject) {
            puller.pullCallback(nationCode, phoneNumber, beginTime, endTime, maxNum, function (err, res, resData) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData: resData,
                        req: res.req,
                    });
                }
            });
        });
    };
    BaseService.prototype.SmsMobileStatusPullReply = function (data) {
        if (data === void 0) { data = {}; }
        var nationCode = data.nationCode, phoneNumber = data.phoneNumber, beginTime = data.beginTime, endTime = data.endTime, maxNum = data.maxNum;
        var puller = this.qcloudsms.SmsMobileStatusPuller();
        return new Promise(function (resolve, reject) {
            puller.pullReply(nationCode, phoneNumber, beginTime, endTime, maxNum, function (err, res, resData) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData: resData,
                        req: res.req,
                    });
                }
            });
        });
    };
    BaseService.prototype.VoiceFileUpload = function (data) {
        if (data === void 0) { data = {}; }
        var fileContent = data.fileContent, _a = data.contentType, contentType = _a === void 0 ? 'mp3' : _a;
        var uploader = this.qcloudsms.VoiceFileUploader();
        return new Promise(function (resolve, reject) {
            uploader.upload(fileContent, contentType, function (err, res, resData) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData: resData,
                        req: res.req,
                    });
                }
            });
        });
    };
    BaseService.prototype.FileVoiceSend = function (data) {
        if (data === void 0) { data = {}; }
        var nationCode = data.nationCode, phoneNumber = data.phoneNumber, fid = data.fid, _a = data.playtimes, playtimes = _a === void 0 ? 2 : _a, ext = data.ext;
        var sender = this.qcloudsms.FileVoiceSender();
        return new Promise(function (resolve, reject) {
            sender.send(nationCode, phoneNumber, fid, playtimes, ext, function (err, res, resData) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData: resData,
                        req: res.req,
                    });
                }
            });
        });
    };
    BaseService.prototype.TtsVoiceSend = function (data) {
        if (data === void 0) { data = {}; }
        var nationCode = data.nationCode, phoneNumber = data.phoneNumber, templId = data.templId, _a = data.params, params = _a === void 0 ? [] : _a, _b = data.playtimes, playtimes = _b === void 0 ? 2 : _b, ext = data.ext;
        var sender = this.qcloudsms.TtsVoiceSender();
        return new Promise(function (resolve, reject) {
            sender.send(nationCode, phoneNumber, templId, params, playtimes, ext, function (err, res, resData) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData: resData,
                        req: res.req,
                    });
                }
            });
        });
    };
    return BaseService;
}());

var SMS = (function (_super) {
    __extends(SMS, _super);
    function SMS() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SMS.prototype.init = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _a, smsAppID, smsAppKey, smsClient, data, resData, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.tcbService, smsAppID = _a.smsAppID, smsAppKey = _a.smsAppKey;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        smsClient = new BaseService$1({ AppID: smsAppID, AppKey: smsAppKey });
                        return [4, smsClient.init({
                                action: this.action,
                                data: this.data
                            })];
                    case 2:
                        data = _b.sent();
                        resData = data.resData;
                        return [2, {
                                code: resData.result,
                                message: !resData.result ? 'success' : resData.errmsg,
                                data: resData,
                            }];
                    case 3:
                        e_1 = _b.sent();
                        return [2, {
                                code: e_1.code || 1000,
                                message: e_1.message
                            }];
                    case 4: return [2];
                }
            });
        });
    };
    return SMS;
}(Base));

var axios = require('axios');
var Utils = (function () {
    function Utils(tcbService) {
        this.tcbService = tcbService;
    }
    Utils.prototype.getContent = function (_a) {
        var _b = _a.fileID, fileID = _b === void 0 ? null : _b, _c = _a.url, url = _c === void 0 ? null : _c, _d = _a.options, options = _d === void 0 ? {} : _d;
        return __awaiter(this, void 0, Promise, function () {
            var result, image, imageBase64, e_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 5, , 6]);
                        if (!fileID) return [3, 2];
                        return [4, this.tcbService.cloud.downloadFile({
                                fileID: fileID
                            })];
                    case 1:
                        result = _e.sent();
                        if (result.fileContent) {
                            return [2, result.fileContent];
                        }
                        return [3, 4];
                    case 2:
                        if (!url) return [3, 4];
                        return [4, axios.get(url, __assign({ responseType: 'arraybuffer' }, options))];
                    case 3:
                        image = _e.sent();
                        if (image.data) {
                            imageBase64 = image.data;
                            return [2, imageBase64];
                        }
                        _e.label = 4;
                    case 4: return [3, 6];
                    case 5:
                        e_1 = _e.sent();
                        console.log(e_1);
                        return [3, 6];
                    case 6: return [2, null];
                }
            });
        });
    };
    return Utils;
}());

var cloud = require('tcb-admin-node');
var TcbService = (function () {
    function TcbService(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.secretID, secretID = _c === void 0 ? null : _c, _d = _b.secretKey, secretKey = _d === void 0 ? null : _d, _e = _b.smsAppID, smsAppID = _e === void 0 ? null : _e, _f = _b.smsAppKey, smsAppKey = _f === void 0 ? null : _f, _g = _b.env, env = _g === void 0 ? null : _g;
        this.cloud = cloud;
        this.env = env;
        this.secretID = secretID || process.env.TENCENTCLOUD_SECRETID;
        this.secretKey = secretKey || process.env.TENCENTCLOUD_SECRETKEY;
        this.smsAppID = smsAppID;
        this.smsAppKey = smsAppKey;
        this.cloud.init({
            secretId: this.secretID,
            secretKey: this.secretKey,
            env: env
        });
        this.utils = new Utils(this);
    }
    TcbService.prototype.callService = function (_a) {
        var service = _a.service, _b = _a.version, version = _b === void 0 ? 'v1.0.0' : _b, action = _a.action, _c = _a.data, data = _c === void 0 ? {} : _c, _d = _a.options, options = _d === void 0 ? {} : _d;
        switch (service) {
            case 'ai': {
                var ai = new AI(this, version, action, data, options);
                return ai.init();
            }
            case 'sms': {
                var sms = new SMS(this, version, action, data, options);
                return sms.init();
            }
        }
    };
    return TcbService;
}());

module.exports = TcbService;
