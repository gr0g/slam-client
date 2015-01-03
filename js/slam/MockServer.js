define([
    'slam/Map'
], function(
    Map
) {
    var MockRobot = function MockRobot(imgData) {
        var self = {};

        var SIZE = [6, 6];      // Inches
        var SENSOR_RANGE_MIN = 6;  // Inches
        var SENSOR_RANGE_MAX = 36;  // Inches
        var SAMPLE_COUNT = 2 * Math.PI * SENSOR_RANGE_MAX; // Take a sample every inch at worst
        var SAMPLE_RAD = 2 * Math.PI / SAMPLE_COUNT;

        var actualPos = [800,700];
        var actualDir = 0;

        var map;

        var ctor = function() {
            map = new Map(imgData.width, imgData.height);
            map.fromImage(imgData.data);
        };

        // ------------------------------------- public methods -------------------------------------------------------
        self.scan = function(cb, scale) {
            var samples = [];
            for(var mastRad = -Math.PI; mastRad <= Math.PI; mastRad += SAMPLE_RAD) {
                var absRad = mastRad + actualDir;
                var vec = [Math.cos(absRad), Math.sin(absRad)];
                var dist = undefined;
                for(var d = SENSOR_RANGE_MIN; d < SENSOR_RANGE_MAX; d += 0.5) {
                    var x = Math.floor(actualPos[0] + vec[0] * d * scale);
                    var y = Math.floor(actualPos[1] + vec[1] * d * scale);
                    if(map.testObstruction(x, y)
                        || map.testObstruction(x+1, y)
                        || map.testObstruction(x, y+1)
                        || map.testObstruction(x+1, y+1)
                    ) {
                        dist = d;
                        break;
                    }
                }
                samples.push({radians: mastRad, inches: dist});
            }
            setTimeout(function() {cb(samples)}, 100);
        };

        self.drive = function(dist, cb) {
            actualPos[0] += Math.cos(actualDir) * dist;
            actualPos[1] += Math.sin(actualDir) * dist;
            setTimeout(function() {cb(dist)}, 100);
        };

        self.turn = function(radians, cb) {
            actualDir += radians;
            setTimeout(function() {cb(radians)}, 100);
        };

        // --------------------------------------- test methods -------------------------------------------------------
        self.drawSamples = function(ctx, scale, samples) {
            var oldFill = ctx.fillStyle;

            ctx.fillStyle = '#FF4444';
            for(var i = 0; i < samples.length; i++) {
                var sample = samples[i];
                if(sample.inches === undefined) {
                    continue;
                }
                var x = actualPos[0] + Math.cos(actualDir + sample.radians) * sample.inches * scale;
                var y = actualPos[1] + Math.sin(actualDir + sample.radians) * sample.inches * scale;
                ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
            }

            ctx.fillStyle = oldFill;
        };

        self.draw = function(ctx, scale) {
            var oldStroke = ctx.strokeStyle;
            ctx.translate(actualPos[0], actualPos[1]);
            ctx.rotate(actualDir);

            ctx.strokeStyle = '#FF0000';
            ctx.strokeRect(-SIZE[0]/2*scale, -SIZE[1]/2*scale, SIZE[0]*scale, SIZE[1]*scale);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(SIZE[1]/2*scale, 0);
            ctx.stroke();

            ctx.rotate(-actualDir);
            ctx.translate(-actualPos[0], -actualPos[1]);
            ctx.strokeStyle = oldStroke;
        };

        ctor();
        return self;
    };

    return MockRobot;
});