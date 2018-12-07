"use strict";
app.alertList = {
    selected: "",
    init: function() {
        var self = this;
        this.tree = new Kom.tree("jstree_alert", this.changed);
        //アラートリストはINIファイルから取得
        var list = Kom.file.matchIni(/AlertList/);
        self.list = [];
        for (var i in list) {
            var cols = list[i].split(/,/);
            self.list.push({
                id: cols[0],
                name: cols[1],
                min: cols[2]
            });
        }
    },
    alertRoot: 0,
    alertNode: [],
    json: [],
    refresh: function() {
        var self = this;
        this.tree.clear();
        this.json = [];
        var icons = Kom.file.matchIni(/AlertIcon/);

        this.json.push({
            name: "Alert",
            children: [],
            icon: "",
            data: JSON.stringify({ type: "tree", param: "all" })
        });
        for (var i = 0; i < self.list.length; i++) {
            var id = "alert" + (i + 1);
            var name = self.list[i].name;
            this.json[0].children.push({
                name: name,
                id: id,
                data: JSON.stringify({
                    type: "tree",
                    param: i
                }),
                icon: icons[i],
                children: []
            });
            this.alertNode[i] = this.json[0].children[i].children;
        }
        self.scanDB();
        this.tree.setjson(this.json);
        this.tree.init();
    },
    alert: [],
    //app.dbをスキャンし、iniで指定されたアラート継続数の分、継続されているアラートだけを検出する
    scanDB: function() {
        this.alert = [];
        var counter = [];
        for (var j = 0; j < this.list.length; j++) {
            counter[j] = { count: 0, pos: -1 };
        }
        for (var i = 0; i < app.db.length; i++) {
            for (var j = 0; j < this.list.length; j++) {
                var key = this.list[j].id;
                var id = "alert" + (j + 1);
                if (app.db[i][key] == "1") {
                    if (counter[j].count == 0) {
                        counter[j].pos = i;
                    }
                    counter[j].count += 1;
                    if (i != app.db.length - 1) {
                        //最後の行はアラートとして出力
                        continue;
                    }
                }
                //最後の行またはアラートフラグが0の場合のみ、出力
                if (counter[j].count >= this.list[j].min) {
                    var pos = counter[j].pos; //継続しているアラートの最初の行番号を出力
                    var time = app.db[pos]["Time"];
                    var date = app.db[pos]["Date"];
                    var name = date + " " + time;
                    var id = "alert" + j + "_cur" + pos;

                    this.alertNode[j].push({
                        name: name,
                        icon: "",
                        data: JSON.stringify({
                            type: "node",
                            param: j,
                            cur: pos
                        }),
                        id: id
                    });

                    var x = app.db[pos]["GPS_x"];
                    var y = app.db[pos]["GPS_y"];
                    var z = app.db[pos]["GPS_z"];
                    this.alert.push({
                        name: name,
                        cur: pos,
                        id: id,
                        type: j,
                        x: x,
                        y: y,
                        z: z
                    });
                    counter[j].count = 0;
                }
            }
        }
    },
    changed: function(obj) {
        var data = obj.data;
        if ("string" == typeof obj.data) {
            data = JSON.parse(obj.data);
        }
        if (data && data.param !== undefined) {
            this.selected = data.param;
            Kom.event.send("changeMarker", {
                type: "alert",
                param: data.param
            });
        }
        if (data && data.cur !== undefined) {
            Kom.event.send("changeAlert", data.cur);
        }
        console.info("changed", obj);
    }
};
app.workingModeList = {
    selected: "",
    init: function() {
        var self = this;
        this.tree = new Kom.tree("jstree_workingmode", this.changed);
        var list = Kom.file.matchIni(/WorkingMode/);
        self.list = [];
        for (var i in list) {
            var cols = list[i].split(/,/);
            self.list.push({ id: cols[0], name: cols[1] });
            self.listindex[cols[0]] = i;
        }
    },
    listindex: {},
    workingModeRoot: 0,
    workingModeNode: [],
    json: [],
    refresh: function() {
        var self = this;
        this.tree.clear();

        var icons = Kom.file.matchIni(/WorkingIcon/);
        this.json = [];
        this.json.push({
            name: "Working Mode",
            children: [],
            icon: "",
            data: JSON.stringify({ type: "tree", param: "all" })
        });
        for (var i = 0; i < self.list.length; i++) {
            var id = "workingMode" + (i + 1);
            var name = self.list[i].name;
            this.json[0].children.push({
                name: name,
                id: id,
                icon: icons[i],
                data: JSON.stringify({ type: "tree", param: i }),
                children: []
            });
            this.workingModeNode[i] = this.json[0].children[i].children;
        }
        self.scanDB();
        this.tree.setjson(this.json);
        this.tree.init();
    },
    scanDB: function() {
        var self = this;
        this.workingMode = [];
        this.alert = [];
        var prev = -1;
        var pos = -1;
        for (var i = 0; i < app.db.length; i++) {
            var val = app.db[i]["WK_Loader_Working_Mode"];
            if (val == 0) {
                continue;
            }
            // データが前回と異なる場合は保存してある開始行を出力
            if (prev == -1) {
                pos = i;
                prev = val;
            }
            if (prev == val && i != app.db.length - 1) {
                continue;
            }
            var time = app.db[pos]["Time"];
            var date = app.db[pos]["Date"];
            var name = date + " " + time;
            var index = this.listindex[prev];

            var id = "workingMode" + index + "_cur" + pos;

            this.workingModeNode[index].push({
                name: name,
                icon: "",
                data: JSON.stringify({
                    type: "node",
                    param: index,
                    cur: pos
                }),
                id: id
            });

            var x = app.db[pos]["GPS_x"];
            var y = app.db[pos]["GPS_y"];
            var z = app.db[pos]["GPS_z"];
            this.alert.push({
                name: name,
                cur: pos,
                id: id,
                type: index,
                x: x,
                y: y,
                z: z
            });

            prev = val;
            pos = i;
        }
    },
    changed: function(obj) {
        var data = obj.data;
        if ("string" == typeof obj.data) {
            data = JSON.parse(obj.data);
        }
        if (data && data.param !== undefined) {
            Kom.event.send("changeMarker", {
                type: "workingmode",
                param: data.param
            });
        }
        if (data && data.cur !== undefined) {
            Kom.event.send("changeAlert", data.cur);
        }
        console.info("changed", obj);
    }
};

Kom.onload.add(function() {
    app.alertList.init();
    app.workingModeList.init();
});

Kom.event.onReceive("onChangeDB", function(tag, cur) {
    console.dir("alertList onChangeDB");
    if (app.db.length == 0) {
        return;
    }
    app.alertList.refresh();
    app.workingModeList.refresh();
});
Kom.event.onReceive("systime", function(tag, cur) {});
