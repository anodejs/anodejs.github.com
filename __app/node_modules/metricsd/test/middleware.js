/*jshint expr:true */
/*global describe:true, before:true, beforeEach:true, after:true, afterEach:true it:true */
"use strict";

var EventEmitter = require("events").EventEmitter,
    metricsd = require("../index"),
    expect = require("chai").expect;

describe("metrics.middleware", function() {
    var metrics;
    var _send;
    var req;
    var res;
    var next;

    beforeEach(function() {
        metrics = metricsd();

        // allow metrics._send() to be mocked
        _send = metrics._send;

        req = {};
        res = new EventEmitter();
        next = function() {};
    });

    afterEach(function() {
        metrics._send = _send;

        _send = undefined;

        req = undefined;
        res = undefined;
        next = undefined;
    });

    describe(".Measure", function() {
        var event;
        var metric;

        beforeEach(function() {
            event = "finished";
            metric = "requestTime";
        });

        afterEach(function() {
            event = undefined;
            metric = undefined;
        });

        it("should return Express-compatible middleware", function(done) {
            var fn = metrics.middleware.Measure(event, metric);

            fn(req, res, done);
        });

        it("should register an event handler for the specified event name", function(done) {
            var fn = metrics.middleware.Measure(event, metric);

            fn(req, res, function() {
                expect(res.listeners(event)).to.have.length(1);

                done();
            });
        });

        it("should update the named histogram when the specified event fires", function(done) {
            var fn = metrics.middleware.Measure(event, metric);

            fn(req, res, next);

            metrics._send = function(str) {
                expect(str).to.match(new RegExp(metric + ":\\d+\\|h\\n"));

                done();
            };

            res.emit(event);
        });

        it("should treat the 'name' parameter as a name lookup if it's a function", function(done) {
            var fn = metrics.middleware.Measure(event, function(req, res, eventName, elapsedTime) {
                expect(eventName).to.equal(event);

                return metric;
            });

            fn(req, res, next);

            metrics._send = function(str) {
                expect(str).to.match(new RegExp(metric + ":\\d+\\|h\\n"));

                done();
            };

            res.emit(event);
        });

        it("should handle lookups returning multiple names", function(done) {
            var metricNames = [metric, "test.requestTime"];

            var fn = metrics.middleware.Measure(event, function(req, res, eventName, elapsedTime) {
                return metricNames;
            });

            fn(req, res, next);

            var sent = 0;
            metrics._send = function(str) {
                expect(str).to.match(new RegExp(metricNames[sent++] + ":\\d+\\|h\\n"));

                if (sent === 2) {
                    done();
                }
            };

            res.emit(event);
        });
    });

    describe(".TimeFilter", function() {
        var metric;

        beforeEach(function() {
            metric = "providedMiddleware";
        });

        afterEach(function() {
            metric = undefined;
        });

        it("should be Express-compatible middleware", function(done) {
            var fn = metrics.middleware.TimeFilter(metric, function(req, res, next) {
                next();
            });

            fn(req, res, function() {
                done();
            });
        });

        it("should call the provided filter", function(done) {
            var fn = metrics.middleware.TimeFilter(metric, function(req, res, next) {
                done();
            });

            fn(req, res, next);
        });

        it("should measure the time that the provided filter takes", function(done) {
            var fn = metrics.middleware.TimeFilter(metric, function(req, res, next) {
                next();
            });

            metrics._send = function(str) {
                expect(str).to.match(new RegExp(metric + ":\\d+\\|h\\n"));

                done();
            };

            fn(req, res, next);
        });
    });

    describe(".Timer", function() {
        it("should be Express-compatible middleware", function(done) {
            metrics.middleware.Timer(req, res, done);
        });

        it("should add a 'timer' property to the provided request", function(done) {
            metrics.middleware.Timer(req, res, function() {
                expect(req.timer).to.be.an.instanceof(metrics.Timer);

                done();
            });
        });

        it("should leave an existing 'timer' property alone", function(done) {
            var timer = {};
            req.timer = timer;

            metrics.middleware.Timer(req, res, function() {
                expect(req.timer).to.equal(timer);

                done();
            });
        });
    });
});
