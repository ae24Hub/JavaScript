"use strict";

var margin = { top: 10, right: 30, bottom: 30, left: 50 },
    width = 930 - margin.left - margin.right,
    height = 120 - margin.top - margin.bottom;

var x = d3.time.scale().range([0, width]);

var y = d3.scale.linear().range([height, 0]);

var formatDate = d3.time.format("%m/%d %H:%M");

var tipFormat = d3.time.format("%m/%d %H:%M:%S");

var xAxis = d3.svg
    .axis()
    .scale(x)
    .ticks(3)
    .tickSize(-height)
    .tickPadding(10)
    .tickSubdivide(true)
    .orient("bottom")
    .tickFormat(formatDate);

var yAxis = d3.svg
    .axis()
    .scale(y)
    .tickPadding(10)
    .tickSize(-width)
    .tickSubdivide(true)
    .orient("left");

function f(name) {
    var params = Array.prototype.slice.call(arguments, 1);
    return function(d) {
        if (typeof params[0] === "function") {
            return params[0](d[name]);
        }
    };
}

var line = d3.svg
    .line()
    .interpolate("linear")
    .x(f("x", x))
    /*.x(function(d) {
                return x(d.x);
            })*/
    //.y(f("y", y));
    .y(function(d) {
        return y(d.y);
    });

var curline = d3.svg
    .line()
    .x(function(d) {
        return x(d[0]);
    })
    .y(function(d) {
        return y(d[1]);
    });

app.graph.chart = {
    init: function(id, data) {
        var self = this;
        var chartId = self.returnId(id);
        app.graph.chart.remove(chartId);
        var isData = self.checkData(data);
        if (!isData) {
            return;
        }
        self.data = data;
        self.parseData = self.getParseX(data);
        self.maxminX = self.getMaxminX(self.parseData);
        self.maxminY = self.getMaxminY(self.parseData);
        self.chart(id);
        self.makeMultiData(id, self.parseData);
        self.makeMultiMaxminY(id, self.maxminY);
    },
    checkData(data) {
        var self = this;
        var checkData = self.getParseX(data);
        var checkMaxminY = self.getMaxminY(checkData);
        if (isNaN(checkMaxminY.maxY) || isNaN(checkMaxminY.minY)) {
            return false;
        }
        return true;
    },
    changePull: function(numId, data) {
        var self = this;
        var id = self.returnId(Number(numId));
        app.graph.chart.remove(id);
        var isData = self.checkData(data);
        if (!isData) {
            return;
        }
        self.parseData = self.getParseX(data);
        self.makeMultiData(numId, self.parseData);
        var sliceData = self.parseData.slice(self.minCur, self.maxCur + 1);
        self.maxminX = self.getMaxminX(sliceData);
        self.maxminY = self.getMaxminY(sliceData);
        self.makeMultiMaxminY(id, self.maxminY);
        self.chart(numId);
    },
    makeMultiData: function(id, data) {
        var self = this;
        self.multiData.splice(id - 1, 1, data);
    },
    makeMultiMaxminY: function(id, data) {
        var self = this;
        self.multiMaxminY.splice(id - 1, 1, data);
    },
    data: {},
    parseData: {},
    maxminX: {},
    maxminY: {},
    multiData: [],
    multiMaxminY: [],
    getParseX: function(data) {
        var parse = function(d) {
            return Date.parse(d);
        };
        var parseData = data.map(function(d) {
            return { x: parse(d.x), y: Number(d.y) };
        });
        return parseData;
    },
    getMaxminX: function(data) {
        var x = data.map(function(d) {
            return d.x;
        });
        var obj = {};
        obj.maxX = d3.max(x);
        obj.minX = d3.min(x);
        return obj;
    },
    getMaxminY: function(data) {
        var y = data.map(function(d) {
            return d.y;
        });
        var obj = {};
        obj.maxY = Math.max.apply(null, y);
        obj.minY = Math.min.apply(null, y);
        if (obj.maxY === obj.minY) {
            obj.maxY += 1;
        }
        obj.midY = (obj.maxY + obj.minY) / 2;
        return obj;
    },
    chart: function(id) {
        var self = this;
        x.domain([self.maxminX.minX, self.maxminX.maxX]);

        y.domain([self.maxminY.minY, self.maxminY.maxY]);

        yAxis.tickValues([
            self.maxminY.minY,
            self.maxminY.midY,
            self.maxminY.maxY
        ]);

        var chartId = self.returnId(id);

        var svg = d3
            .select(chartId)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr(
                "viewBox",
                "0 0 " +
                    (width + margin.left + margin.right) +
                    " " +
                    (height + margin.top + margin.bottom)
            )
            .append("g")
            .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
            )
            .attr("fill", "none");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.selectAll(".line")
            .data([self.parseData])
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("clip-path", "url(#clip)")
            .attr("stroke", "goldenrod")
            .attr("d", line);

        svg.append("path")
            .attr("class", "curline")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("clip-path", "url(#clip)")
            .attr("stroke", "lightcoral")
            .attr("stroke-width", 2)
            .attr(
                "d",
                curline([
                    [self.parseData[self.holdCur].x, self.maxminY.minY],
                    [self.parseData[self.holdCur].x, self.maxminY.maxY]
                ])
            );

        self.minCur = Kom.file.getIndex(self.parseData, "x", self.maxminX.minX);
        self.maxCur = Kom.file.getIndex(self.parseData, "x", self.maxminX.maxX);

        var brush = d3.svg
            .brush()
            .x(x)
            .on("brushend", brushed)
            .on("brush", function() {
                var onMouse = d3.mouse(this);
                self.showTooltip(onMouse);
            });

        svg.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("height", height)
            .attr("stroke", "darkblue");

        svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        function brushed() {
            if (
                Date.parse(brush.extent()[1]) - Date.parse(brush.extent()[0]) <
                60000
            ) {
                self.clearBrush();
                return;
            }
            app.setPause();
            var checkMinCur = Kom.file.getIndex(
                self.parseData,
                "x",
                Date.parse(brush.extent()[0])
            );
            var checkMaxCur = Kom.file.getIndex(
                self.parseData,
                "x",
                Date.parse(brush.extent()[1])
            );
            if (checkMinCur === undefined || checkMaxCur === undefined) {
                self.clearBrush();
                return;
            }
            self.minCur = checkMinCur;
            self.maxCur = checkMaxCur;
            self.multiData.forEach((d, index) => {
                var id = self.returnId(Number(index) + 1);
                var sliceData = d.slice(self.minCur, self.maxCur + 1);
                self.changeDomainX(sliceData);
                self.maxminY = self.multiMaxminY[index];
                y.domain([
                    self.multiMaxminY[index].minY,
                    self.multiMaxminY[index].maxY
                ]);
                yAxis.tickValues([
                    self.multiMaxminY[index].minY,
                    self.multiMaxminY[index].midY,
                    self.multiMaxminY[index].maxY
                ]);
                self.callCurline(id, index);
                self.callXaxis(id);
                self.callYaxis(id);
                self.callLine(id, d);
            });
            self.clearBrush();
            app.setData(self.minCur);
        }
        d3.select("#resetBtn").on("click", self.reset);
        d3.select("#fitBtn").on("click", self.fit);
        d3.select("#extendBtn").on("click", self.extend);
        d3.select("#shrinkBtn").on("click", self.shrink);

        var tooltip = d3
            .select(chartId)
            .append("div")
            .attr("class", "tooltip");

        tooltip.append("div").attr("class", "diffCur");

        tooltip.append("div").attr("class", "dateOnMouse");

        d3.selectAll("rect").on("mouseover", function() {
            self.activeTooltipID =
                "#" +
                d3.select(this).node().parentNode.parentNode.parentNode
                    .parentNode.id;
            var onMouse = d3.mouse(this);
            self.showTooltip(onMouse);
        });

        d3.selectAll("rect").on("mousemove", function() {
            var onMouse = d3.mouse(this);
            self.showTooltip(onMouse);
        });
        d3.selectAll("rect").on("mouseout", function() {
            d3.selectAll(".tooltip").style("display", "none");
        });
    },
    showTooltip: function(onMouse) {
        var self = app.graph.chart;
        var tipHoldCur = self.holdCur;

        var onMouseCur = Kom.file.getIndex(
            self.parseData,
            "x",
            Date.parse(x.invert(onMouse[0]))
        );
        if (onMouseCur === undefined) {
            return;
        }

        //指定位置の値に変換
        var sel = self.activeTooltipID.replace(/chart/, "graphList");
        var key = $(sel).val();
        var onMouseVal = app.db[onMouseCur][key];
        var curVal = app.db[tipHoldCur][key];
        var diffVal = onMouseVal - curVal;

        var htmldata = "VAL :" + app.convertData(onMouseVal, key);
        if (app.status.pause) {
            htmldata +=
                "<br />" +
                "CUR :" +
                app.convertData(curVal, key) +
                "<br />" +
                "DIFF:" +
                app.convertData(diffVal, key);
        }

        d3.select(self.activeTooltipID)
            .select(".diffCur")
            .style("color", "white");
        d3.select(self.activeTooltipID)
            .select(".diffCur")
            .html(htmldata);
        d3.select(self.activeTooltipID)
            .select(".dateOnMouse")
            .html(tipFormat(x.invert(onMouse[0])));
        d3.select(self.activeTooltipID)
            .select(".tooltip")
            .style("display", "block");
        d3.select(self.activeTooltipID)
            .select(".tooltip")
            .style("top", onMouse[1] + -70 + "px")
            .style("left", onMouse[0] + 80 + "px");
    },
    activeTooltipID: {},
    callCurline: function(id, index) {
        var self = this;
        d3.select(id)
            .select(".curline")
            .attr(
                "d",
                curline([
                    [
                        self.parseData[self.minCur].x,
                        self.multiMaxminY[index].minY
                    ],
                    [
                        self.parseData[self.minCur].x,
                        self.multiMaxminY[index].maxY
                    ]
                ])
            );
    },
    callHoldCurline: function(id, index) {
        var self = this;
        d3.select(id)
            .select(".curline")
            .attr(
                "d",
                curline([
                    [
                        self.parseData[self.holdCur].x,
                        self.multiMaxminY[index].minY
                    ],
                    [
                        self.parseData[self.holdCur].x,
                        self.multiMaxminY[index].maxY
                    ]
                ])
            );
    },
    clearBrush: function() {
        d3.selectAll(".extent")
            .attr("width", 0)
            .attr("x", 0);
        d3.selectAll(".resize").attr("transform", "translate(0,0)");
    },
    extend: function() {
        var self = app.graph.chart;
        var scalingRate = Math.round(
            ((self.maxCur - self.minCur) * 1.5 - (self.maxCur - self.minCur)) /
                2
        );
        if (self.parseData[self.minCur - scalingRate] === undefined) {
            var min = self.getMaxminX(self.parseData);
            self.minCur = Kom.file.getIndex(self.parseData, "x", min.minX);
        } else {
            self.minCur -= scalingRate;
        }
        if (self.parseData[self.maxCur + scalingRate] === undefined) {
            var max = self.getMaxminX(self.parseData);
            self.maxCur = Kom.file.getIndex(self.parseData, "x", max.maxX);
        } else {
            self.maxCur += scalingRate;
        }
        self.multiData.forEach((d, index) => {
            var id = self.returnId(Number(index) + 1);
            var sliceData = d.slice(self.minCur, self.maxCur + 1);
            self.changeDomainX(sliceData);
            self.changeDomainY(sliceData);
            self.makeMultiMaxminY(Number(index) + 1, self.maxminY);
            self.callHoldCurline(id, index);
            self.callXaxis(id);
            self.callYaxis(id);
            self.callLine(id, d);
        });
    },
    shrink: function() {
        var self = app.graph.chart;
        var scalingRate = Math.round(
            ((self.maxCur - self.minCur) * 1.5 - (self.maxCur - self.minCur)) /
                2
        );
        if (
            self.parseData[self.maxCur - scalingRate].x -
                self.parseData[self.minCur + scalingRate].x <
            60000
        ) {
            return;
        } else {
            self.minCur += scalingRate;
            self.maxCur -= scalingRate;
        }
        self.multiData.forEach((d, index) => {
            var id = self.returnId(Number(index) + 1);
            var sliceData = d.slice(self.minCur, self.maxCur + 1);
            self.changeDomainX(sliceData);
            self.changeDomainY(sliceData);
            self.makeMultiMaxminY(Number(index) + 1, self.maxminY);
            self.callHoldCurline(id, index);
            self.callXaxis(id);
            self.callYaxis(id);
            self.callLine(id, d);
        });
        app.setData(self.minCur);
    },
    reset: function() {
        var self = app.graph.chart;
        self.multiData.forEach((d, index) => {
            var id = self.returnId(Number(index) + 1);
            self.changeDomainX(d);
            self.changeDomainY(d);
            self.makeMultiMaxminY(Number(index) + 1, self.maxminY);
            self.callHoldCurline(id, index);
            self.callXaxis(id);
            self.callYaxis(id);
            self.minCur = Kom.file.getIndex(d, "x", self.maxminX.minX);
            self.maxCur = Kom.file.getIndex(d, "x", self.maxminX.maxX);

            self.callLine(id, d);
        });
    },
    fit: function() {
        var self = app.graph.chart;
        self.multiData.forEach((d, index) => {
            var id = self.returnId(Number(index) + 1);

            var sliceData = d.slice(self.minCur, self.maxCur + 1);

            self.changeDomainY(sliceData);

            self.makeMultiMaxminY(Number(index) + 1, self.maxminY);

            self.callYaxis(id);

            self.callLine(id, d);
        });
    },
    changeDomainX: function(d) {
        var self = this;
        self.maxminX = self.getMaxminX(d);
        x.domain([self.maxminX.minX, self.maxminX.maxX]);
    },
    changeDomainY: function(d) {
        var self = this;
        self.maxminY = self.getMaxminY(d);
        y.domain([self.maxminY.minY, self.maxminY.maxY]);
        yAxis.tickValues([
            self.maxminY.minY,
            self.maxminY.midY,
            self.maxminY.maxY
        ]);
    },
    callXaxis: function(id) {
        d3.select(id)
            .select(".x.axis")
            .call(xAxis);
    },
    callYaxis: function(id) {
        d3.select(id)
            .select(".y.axis")
            .call(yAxis);
    },
    callLine: function(id, data) {
        d3.select(id).select(".line").remove;
        d3.select(id)
            .select(".line")
            .data([data])
            .attr("d", line);
    },
    returnId: function(num) {
        var self = this;
        return self.status.chartId + num;
    },
    remove: function(id) {
        d3.select(id)
            .select("svg")
            .remove();
    },
    minCur: {},
    maxCur: {},
    holdCur: {},
    cur: function(cur) {
        var self = this;
        self.holdCur = cur;
        if (self.parseData[cur] === undefined) {
            return;
        }
        d3.selectAll(".curline")
            .transition()
            .ease("linear")
            .duration(1000)
            .attr(
                "d",
                curline([
                    [self.parseData[cur].x, self.maxminY.minY],
                    [self.parseData[cur].x, self.maxminY.maxY]
                ])
            );
        if (cur > self.maxCur) {
            //残り進む割合
            var toMaxper =
                (app.status.playSpeed - (cur - self.maxCur)) /
                app.status.playSpeed;
            //最後まで進むときのduration
            var toMaxDuration = 1000 * toMaxper + 20;
            if (toMaxDuration >= 980) {
                toMaxDuration -= 70;
            }
            //残り分進むときのduration
            var restartDuration = (1 - toMaxper) * 1000 + 20;

            //+ループパターン
            Promise.resolve()
                .then(function() {
                    return new Promise(function(resolve, rejected) {
                        d3.selectAll(".curline")
                            .transition()
                            .ease("linear")
                            .duration(toMaxDuration)
                            .attr(
                                "d",
                                curline([
                                    [
                                        self.parseData[self.maxCur].x,
                                        self.maxminY.minY
                                    ],
                                    [
                                        self.parseData[self.maxCur].x,
                                        self.maxminY.maxY
                                    ]
                                ])
                            );
                        resolve();
                    });
                })
                .then(function() {
                    if (app.status.playLoop) {
                        return Promise.resolve()
                            .then(function() {
                                return new Promise(function(resolve, rejected) {
                                    setTimeout(() => {
                                        d3.selectAll(".curline").attr(
                                            "d",
                                            curline([
                                                [
                                                    self.parseData[self.minCur]
                                                        .x,
                                                    self.maxminY.minY
                                                ],
                                                [
                                                    self.parseData[self.minCur]
                                                        .x,
                                                    self.maxminY.maxY
                                                ]
                                            ])
                                        );
                                        resolve();
                                    }, toMaxDuration + 20);
                                });
                            })
                            .then(function() {
                                return new Promise(function(resolve, rejected) {
                                    /*d3.selectAll(".curline")
                                        .transition()
                                        .ease("linear")
                                        .duration(ss)
                                        .attr(
                                            "d",
                                            curline([
                                                [
                                                    self.parseData[cur].x,
                                                    self.maxminY.minY
                                                ],
                                                [
                                                    self.parseData[cur].x,
                                                    self.maxminY.maxY
                                                ]
                                            ])
                                        );
                                    console.log("3残り分進む");*/
                                    resolve();
                                });
                            })
                            .then(function() {
                                return new Promise(function(resolve, rejected) {
                                    app.setData(self.minCur);
                                });
                            });
                    } else {
                        return Promise.resolve()
                            .then(function() {
                                return new Promise(function(resolve, rejected) {
                                    setTimeout(() => {
                                        self.nextChart();
                                        resolve();
                                    }, toMaxDuration);
                                });
                            })
                            .then(function() {
                                return new Promise(function(resolve, rejected) {
                                    setTimeout(() => {
                                        d3.selectAll(".curline").attr(
                                            "d",
                                            curline([
                                                [
                                                    self.maxminX.minX,
                                                    self.maxminY.minY
                                                ],
                                                [
                                                    self.maxminX.minX,
                                                    self.maxminY.maxY
                                                ]
                                            ])
                                        );
                                        resolve();
                                    }, 10);
                                });
                            })
                            .then(function() {
                                return new Promise(function(resolve, rejected) {
                                    d3.selectAll(".curline")
                                        .transition()
                                        .ease("linear")
                                        .duration(restartDuration)
                                        .attr(
                                            "d",
                                            curline([
                                                [
                                                    self.parseData[cur].x,
                                                    self.maxminY.minY
                                                ],
                                                [
                                                    self.parseData[cur].x,
                                                    self.maxminY.maxY
                                                ]
                                            ])
                                        );
                                });
                            });
                    }
                });
        }
    },
    nextChart: function() {
        var self = this;
        var len = self.maxCur - self.minCur + 1;
        self.minCur = self.maxCur + 1;
        self.maxCur = self.maxCur + len;

        self.multiData.forEach((d, index) => {
            var id = self.returnId(Number(index) + 1);

            var sliceData = d.slice(self.minCur, self.maxCur + 1);
            self.changeDomainX(sliceData);
            self.changeDomainY(sliceData);
            self.makeMultiMaxminY(Number(index) + 1, self.maxminY);
            self.callXaxis(id);
            self.callYaxis(id);
            self.callLine(id, d);
        });
    },
    changeAlert: function(cur) {
        var self = this;
        app.setData(cur);
        if (cur > self.minCur && self.maxCur > cur) {
            return;
        }
        var len = self.maxCur - self.minCur + 1;
        self.minCur = cur;
        self.maxCur = cur + len;

        self.multiData.forEach((d, index) => {
            var id = self.returnId(Number(index) + 1);
            var sliceData = d.slice(self.minCur, self.maxCur + 1);
            self.changeDomainX(sliceData);
            self.changeDomainY(sliceData);
            self.makeMultiMaxminY(Number(index) + 1, self.maxminY);
            self.callCurline(id, index);
            self.callXaxis(id);
            self.callYaxis(id);
            self.callLine(id, d);
        });
    },
    status: {
        chartId: "#chart"
    }
};
