'use strict';

let should = require('should');

let services = [
    'contentCensor',
    'imageSearch',
    'bodyanalysis',
    'imageProcess',
    'imageClassify',
    'face',
    'ocr',
    'nlp',
    'kg',
    'speech'
    ];

it('should not throw error when require all modules', function() {
    should.doesNotThrow(function () {
        let exp = require('../');
    });
});

describe('should all export is valid', function() {
    should.doesNotThrow(function () {
        let exp = require('../');
        services.forEach(function(serviceNm) {
            // each service should be a constructor
            it("service:" + serviceNm, function () {
                exp[serviceNm].should.instanceof(Function);
            })
        });
        it("HttpClient ", function () {
            // extra exports HttpClient is Function
            exp.HttpClient.should.instanceof(Function);
        });
    });
});
