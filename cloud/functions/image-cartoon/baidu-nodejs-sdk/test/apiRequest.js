'use strict';

let should = require('should');

let exp = require('../');

let services = [
    'contentCensor',
    'bodyanalysis',
    'imageSearch',
    'imageProcess',
    'imageClassify',
    'face',
    'ocr',
    'nlp',
    'kg',
    'speech'
    ];

// just make sure method is excutable
services.forEach(function(serviceNm) {
    describe(serviceNm + ' excutable test', function() {
        let client = new exp[serviceNm](0, "FAKE API_KEY", "FAKE SECRET_KEY");
        let apiMethodsNms = getApiMethodsName(client);
        apiMethodsNms.forEach(function(elm) {
            it(elm + ' method excutable test', function () {
                let pms = client[elm]();
                pms.should.instanceof(Promise);
            });
        });
    });
});

function getApiMethodsName(client) {
    let nms = [];
    Object.getOwnPropertyNames(client.__proto__).forEach(function(method) {
        // method name end with Impl is not api method
        let isImpl = /Impl$/.test(method);
        if (isImpl || method === 'constructor') {
            return
        }
        nms.push(method);
    });
    return nms;
}

