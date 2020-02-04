const request = require('request');
const QueryString = require("querystring");

/**
 * @inner
 */
class HttpConnection {
    static doRequest(method, url, data, headers, callback, opt={}) {
        let req = {
            method: method,
            url: url,
            json: false,
        };
        if(headers){
            req.headers = headers;
        }
        if (method === "GET") {
            req.url += "?" + QueryString.stringify(data);
        } else {
            req.body = JSON.stringify(data);
        }
        Object.assign(req, opt);
        request(req, function (error, response, body) {
            /**
            * `.request` 的请求回调
            * @callback requestCallback
            * @param {Error} error 请求错误
            * @param {Object} response 请求响应
            * @param {String} body API 请求结果
            */

            callback(error, response, body);
        })
    }
}
module.exports = HttpConnection;