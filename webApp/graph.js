"use strict";

app.graph = {
    init: function() {
        var list = Kom.file.matchIni(app.graph.status.matchStr);
        var initialList = Kom.file.matchIni(app.graph.status.initialMatch);
        app.graph.addpull(list, initialList);
        setTimeout(() => {
            for (var i = 0; i < initialList.length; i++) {
                app.graph.RecirveCur(i + 1, initialList[i]);
            }
            for (var i = 0; i < initialList.length; i++) {
                var data = app.graph.sendChart(initialList[i]);
                app.graph.chart.init(i + 1, data);
            }
        }, 30);
    },
    RecirveCur: function(id, data) {
        var self = this;
        Kom.event.onReceive("systime", function(tag, cur) {
            self.cur = cur;
            if (cur === null) {
                cur = 0;
            }
            if (id === 1) {
                var data1 = app.convertData(app.db[cur][data], data);
                document.getElementById("graphVal1").innerHTML = data1;
            } else if (id === 2) {
                var data2 = app.convertData(app.db[cur][data], data);
                document.getElementById("graphVal2").innerHTML = data2;
            } else if (id === 3) {
                var data3 = app.convertData(app.db[cur][data], data);
                document.getElementById("graphVal3").innerHTML = data3;
            } else if (id === 4) {
                var data4 = app.convertData(app.db[cur][data], data);
                document.getElementById("graphVal4").innerHTML = data4;
            }
        });
    },
    cur: 0,
    addpull: function(list, initialList) {
        var self = this;
        for (var i = 1; i < 5; i++) {
            var graphItem = document.getElementById("graphItem" + i);
            var form = document.createElement("form");
            form.setAttribute("id", "graphForm" + i);
            form.setAttribute("name", "graphForm" + i);
            graphItem.appendChild(form);

            var graphForm = document.getElementById("graphForm" + i);
            var select = document.createElement("select");
            select.setAttribute("id", "graphList" + i);
            select.setAttribute("name", "graphList" + i);
            graphForm.appendChild(select);
            var graphList = document.getElementById("graphList" + i);
            for (var l of list) {
                var pull = document.createElement("option");
                pull.setAttribute("value", l);
                graphList.appendChild(pull);
                pull.innerHTML = app.getRes(l);
            }
            var val = document.createElement("p");
            val.setAttribute("id", "graphVal" + i);
            graphItem.appendChild(val);
        }

        for (var i = 0; i < initialList.length; i++) {
            var selected = document.getElementById("graphList" + (i + 1));
            var option = selected.options;
            for (var j = 0; j < option.length; j++) {
                if (option[j].value === initialList[i]) {
                    option[j].selected = true;
                    break;
                }
            }
        }
        initialList.forEach((d, index) => {
            var id = "graphVal" + Number(index + 1);
            if (app.db[self.cur] === undefined) {
                return;
            }
            document.getElementById(id).innerHTML = app.convertData(
                app.db[self.cur][d],
                d
            );
        });
        app.graph.selectedList();
    },

    selectedList: function() {
        var self = this;

        var list1 = document.getElementById("graphList1");
        list1.addEventListener(
            "change",
            function() {
                var val = document.graphForm1.graphList1.value;
                app.graph.RecirveCur(1, val);
                document.getElementById(
                    "graphVal1"
                ).innerHTML = app.convertData(app.db[self.cur][val], val);
                var data = app.graph.sendChart(val);
                app.graph.chart.changePull(1, data);
            },
            false
        );

        var list2 = document.getElementById("graphList2");
        list2.addEventListener(
            "change",
            function() {
                var val = document.graphForm2.graphList2.value;
                app.graph.RecirveCur(2, val);
                document.getElementById(
                    "graphVal2"
                ).innerHTML = app.convertData(app.db[self.cur][val], val);
                var data = app.graph.sendChart(val);
                app.graph.chart.changePull(2, data);
            },
            false
        );

        var list3 = document.getElementById("graphList3");
        list3.addEventListener(
            "change",
            function() {
                var val = document.graphForm3.graphList3.value;
                app.graph.RecirveCur(3, val);
                document.getElementById(
                    "graphVal3"
                ).innerHTML = app.convertData(app.db[self.cur][val], val);
                var data = app.graph.sendChart(val);
                app.graph.chart.changePull(3, data);
            },
            false
        );

        var list4 = document.getElementById("graphList4");
        list4.addEventListener(
            "change",
            function() {
                var val = document.graphForm4.graphList4.value;
                app.graph.RecirveCur(4, val);
                document.getElementById(
                    "graphVal4"
                ).innerHTML = app.convertData(app.db[self.cur][val], val);
                var data = app.graph.sendChart(val);
                app.graph.chart.changePull(4, data);
            },
            false
        );
    },

    sendChart: function(val) {
        var data = [];
        app.db.forEach(d => {
            var obj = {};
            obj.x = d.Date + " " + d.Time;
            obj.y = d[val];
            data.push(obj);
        });
        return data;
    },
    status: {
        matchStr: /graphList/g,
        initialMatch: /graphInitialVal/g
    }
};

Kom.event.onReceive("onChangeDB", function() {
    if (app.db.length === 0) {
        return;
    }
    for (var i = 1; i < 5; i++) {
        var id = "graphItem" + i;
        while (document.getElementById(id).firstChild) {
            document
                .getElementById(id)
                .removeChild(document.getElementById(id).firstChild);
        }
    }
    for (var i = 1; i < 5; i++) {
        var id = "chart" + i;
        while (document.getElementById(id).firstChild) {
            document
                .getElementById(id)
                .removeChild(document.getElementById(id).firstChild);
        }
    }
    app.graph.init();
});

Kom.event.onReceive("changeAlert", function(tag, cur) {
    app.graph.chart.changeAlert(cur);
});

Kom.event.onReceive("systime", function(tag, cur) {
    app.graph.chart.cur(cur);
});
