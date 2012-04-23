"use strict";

/**
 * Factory function intended to be called by the `middleware` getter in
 * metricsd.
 *
 * @param {Object} metrics Configured metricsd instance.
 */
module.exports = function(metrics) {
    var middleware = {};

    /**
     * Measure the time until an event (on the response) fires. It will use the
     * request timer (added via middleware.Timer) if available, otherwise it
     * will create one. If you'd like accurate timings, ensure that
     * middleware.Timer (or this) is as early in the filter chain as possible.
     *
     * @param {String} eventName Response event.
     * @param {String|Array|Function} metricName Metric(s) to write; if
     * a lookup function, it will be called with (req, res, eventName,
     * elapsedTime) and is expected to return a String or an Array.
     *
     * @return {Function} An Express-compatible middleware function.
     */
    middleware.Measure = function(eventName, metricName) {
        return function(req, res, next) {
            middleware.Timer(req, res, function() {
                res.once(eventName, function() {
                    var elapsedTime = req.timer.elapsedTime;

                    if (metricName instanceof Function) {
                        metricName = metricName(req, res, eventName, elapsedTime);
                    }

                    var metricNames = [metricName];
                    if (metricName instanceof Array) {
                        metricNames = metricName;
                    }

                    metricNames.forEach(function(name) {
                        metrics.updateHistogram(name, elapsedTime);
                    });
                });

                next();
            });
        };
    };

    /**
     * Measure the time the provided middleware function takes. For example:
     *
     * Instead of:
     *   app.use(express.cookieParser());
     * to measure its duration:
     *   app.use(metrics.timeMiddleware('express.cookieParser', express.cookieParser()));
     *
     * @param {String} metricName Metric name to write.
     * @param {Function} fn Middleware function to measure.
     *
     * @return {Function} An Express-compatible middleware function.
     */
    middleware.TimeFilter = function(metricName, fn) {
        return function(req, res, next) {
            var timer = metrics.time();

            fn(req, res, function() {
                timer.stop(metricName);

                next.apply(this, arguments);
            });
        };
    };

    /**
     * Establish a timer that can be used throughout the duration of the
     * request / response cycle. This _is_ Express-compatible middleware and
     * should be added to your filter chain as early as possible to ensure
     * correct timings. 
     *
     * @param {Object} req Request.
     * @param {Object} res Response.
     * @param {Function} next Next filter in the chain.
     */
    middleware.Timer = function(req, res, next) {
        req.timer = req.timer || metrics.time();

        next();
    };

    return middleware;
};
