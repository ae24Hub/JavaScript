"use strict";
/*
KomEdgeView Common Library

export:

Kom.onload.add
Kom.event.onReceive
Kom.event.send
Kom.db.load
Kom.db.save
Kom.json.stringify
Kom.json.parse
Kom.file.loadTsv

*/

var Kom = {
    id: "KOM",
    init: function() {}
};

Kom.onload = {
    init: function() {
        var self = this;
        window.addEventListener(
            "load",
            function() {
                self.preFunc(function() {
                    Kom.onload.runAll();
                });
            },
            false
        );
    },
    list: [],
    preFunc: function(cb) {
        cb();
    },
    add: function(cb) {
        Kom.onload.list.push(cb);
    },
    runAll: function() {
        for (var i in Kom.onload.list) {
            var cb = Kom.onload.list[i];
            if ("function" == typeof cb) {
                cb();
            }
        }
    }
};

Kom.onload.init();

Kom.json = {
    parse: function(json) {
        var obj = {};
        try {
            obj = JSON.parse(json);
        } catch (e) {}
        if (obj === null) {
            obj = {};
        }
        return obj;
    },
    stringify: function(obj) {
        return JSON.stringify(obj);
    }
};

Kom.db = {
    id: "KOM-DATA",
    load: function(key, defaultvalue) {
        if (defaultvalue == undefined) {
            defaultvalue = {};
        }
        var data = Kom.db.loadHash();
        if (!data[key]) {
            return defaultvalue;
        }
        return data[key];
    },
    save: function(key, value) {
        var data = Kom.db.loadHash();
        data[key] = value;
        Kom.db.saveHash(data);
    },
    getDb: function() {
        return window.localStorage;
    },
    clearAll: function() {
        this.getDb().removeItem(Kom.db.id);
    },
    loadHash: function(cb) {
        var json, result;
        json = this.getDb().getItem(Kom.db.id);
        result = Kom.json.parse(json);
        return result;
    },
    saveHash: function(data) {
        var json = Kom.json.stringify(data);
        this.getDb().setItem(Kom.db.id, json);
    }
};

Kom.event = {
    send: function(tag, data) {
        var msgObj = JSON.stringify({
            tag: tag,
            data: data
        });
        postMessage(msgObj, "*");
    },
    onReceive: function(tag, cb) {
        var cb_func = function(evt) {
            var msgObj = JSON.parse(evt.data);
            if (msgObj.tag === undefined || msgObj.tag == tag) {
                cb(msgObj.tag, msgObj.data);
            }
        };
        window.addEventListener("message", cb_func, false);
    }
};

Kom.file = {
    loadTsv: function(path, hasHeader, cb) {
        var self = this;
        $.get(path, function(txt) {
            var result = self.parseTsv(txt, hasHeader);
            cb(result);
        });
    },
    parseTsv: function(str, hasHeader) {
        var line = [];
        var arr = str.split(/\r\n|\r|\n/);
        if (hasHeader) {
            var header = arr.shift().split(/[,\t]/);
        }
        $.each(arr, function(idx, row) {
            if (row == "") {
                return;
            }
            var col = row.split(/[,\t]/);
            if (hasHeader) {
                var obj = {};
                for (var i in header) {
                    var key = header[i];
                    obj[key] = col[i];
                }
                line.push(obj);
            } else {
                line.push(col);
            }
        });
        return line;
    },
    getIndex: function(arr, key, value) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][key] === value) {
                return i;
            }
        }
        return;
    },
    loadIni: function(path, cb) {
        var self = this;
        $.get(path, function(txt) {
            var result = self.parseIni(txt);
            cb(result);
        });
    },
    parseIni: function(str) {
        var obj = {};
        var arr = str.split(/\r\n|\r|\n/);
        $.each(arr, function(idx, row) {
            if (row == "" || row.match(/^(;|\/|#|\[)/)) {
                return;
            }
            if (row.includes("=")) {
                var line = row.split("=");
                var key = line[0].trim();
                obj[key] = line[1].trim();
            }
        });
        return obj;
    },
    matchIni: function(matchStr) {
        var self = this;
        var result = [];
        var matchKey = [];
        Object.keys(self.ini).forEach(key => {
            if (!key.match(matchStr)) {
                return;
            }
            matchKey.push(key);
        });
        for (var k of matchKey) {
            result.push(self.ini[k]);
        }
        return result;
    },
    ini: [],
    setIni: function(result) {
        var self = this;
        self.ini = result;
    }
};

Kom.dom = {
    addscript: function(jspath) {
        var scriptTag = document.createElement("script");
        scriptTag.src = jspath;
        var firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(scriptTag, firstScript);
    },
    addcss: function(csspath) {
        var linkTag = document.createElement("link");
        linkTag.rel = "stylesheet";
        linkTag.href = csspath;
        var firstLink = document.getElementsByTagName("link")[0];
        firstLink.parentNode.insertBefore(linkTag, firstLink);
    },
    calcBox: function(id) {
        var element = document.getElementById(id);
        var rect = element.getBoundingClientRect();
        rect.scrollLeft = rect.left + window.pageXOffset;
        rect.scrollTop = rect.top + window.pageYOffset;
        return rect;
    },
    fitWindow: function(width) {
        //実際のウィンドウのサイズ
        var viewport = {
            width: $(window).width() - 20,
            height: $(window).height(),
            viewportWidth: width
        };
        //html内部サイズ(幅は常に固定)
        viewport.viewportHeight = Math.floor(
            (width / viewport.width) * viewport.height
        );
        viewport.zoom = viewport.width / width;

        $("body").css("width", width + "px");
        $("body").css("transform-origin", "top left");
        $("body").css("transform", "scale(" + viewport.zoom + ")");
        return viewport;
    }
};

Kom.tween = {
    debug: false,
    create: function(name, srcValue, dstValue, srcTime, timeSpan) {
        this.set = function(srcValue, dstValue, srcTime, timeSpan) {
            if (isNaN(srcValue) || isNaN(dstValue) || isNaN(timeSpan)) {
                return;
            }
            this.srcValue = srcValue;
            this.dstValue = dstValue;
            this.srcTime = srcTime;
            this.timeSpan = timeSpan;
        };
        this.set(srcValue, dstValue, srcTime, timeSpan);

        this.update = function(time, cb) {
            if (this.timeSpan <= 0) {
                return;
            }
            this.currentTime = time;
            if (this.currentTime > this.srcTime + this.timeSpan) {
                return;
            }
            var uv = (this.currentTime - this.srcTime) / this.timeSpan;
            var val = this.srcValue + uv * (this.dstValue - this.srcValue);
            if (Kom.tween.debug) {
                console.dir(
                    "uv = (" +
                        this.currentTime +
                        " - " +
                        this.srcTime +
                        ") / " +
                        this.timeSpan
                );
                console.dir(
                    "val = (" +
                        this.srcValue +
                        " + uv * (" +
                        this.dstValue +
                        " - " +
                        this.srcValue +
                        ")"
                );
            }
            cb(val);
        };
    }
};

Kom.util = {
    zerofill: function(a, keta) {
        if (a === undefined) {
            a = 0;
        }
        var s = "0000" + a;
        return s.substring(s.length - keta);
    },
    // YYYY/MM/DD形式の文字列をYYYYMMDDにフォーマット
    parse_date: function(d) {
        if (d.match(/\//)) {
            var l = d.split(/\//);
            d =
                this.zerofill(l[0], 4) +
                this.zerofill(l[1], 2) +
                this.zerofill(l[2], 2);
        }
        return d;
    },
    // YYYYMMDDをYYYY/MM/DD形式にフォーマット
    date_fromint: function(l) {
        if (l === undefined || l < 19000000) {
            return "";
        }
        l = "" + l;
        return (
            this.zerofill(l.substr(0, 4), 4) +
            "/" +
            this.zerofill(l.substr(4, 2), 2) +
            "/" +
            this.zerofill(l.substr(6, 2), 2)
        );
    },
    // HH:ii:ss形式の文字列をHHiissにフォーマット
    parse_time: function(d) {
        if (d.match(/:/)) {
            var l = d.split(/[:\.]/);
            d =
                this.zerofill(l[0], 2) +
                this.zerofill(l[1], 2) +
                this.zerofill(l[2], 2);
        }
        return d;
    },
    // HHiissをHH:ii:ss形式にフォーマット
    time_fromint: function(l) {
        if (l === undefined) {
            return "";
        }
        l = "" + l;
        return (
            this.zerofill(l.substr(0, 2), 2) +
            ":" +
            this.zerofill(l.substr(2, 2), 2) +
            ":" +
            this.zerofill(l.substr(4, 2), 2)
        );
    },
    compare_date: function(a, b) {
        if (a < b) {
            return 1;
        } else if (a > b) {
            return -1;
        }
        return 0;
    }
};


    this.init = function() {
        var self = this;
        if (this.json.length > 0) {
            $("#" + this.id).html(this.fromjson(this.json));
        }
        $("#" + this.id).jstree({
            plugins: ["search"],
            core: {
                themes: {
                    icons: true
                },
                expand_selected_onload: true,
                animation: false,
                check_callback: true
            }
        });
        $("#" + this.id).on("changed.jstree", function(e, data) {
            var sel;
            if (data.action == "select_node") {
                sel = true;
            } else if (data.action == "deselect_node") {
                sel = false;
            } else {
                return;
            }
            var id = data.node.id;
            var nodedata = $("#" + id).data("nodedata");

            self.cb({
                selected: data.action == "select_node",
                id: data.node.id,
                data: nodedata
            });
        });
    };
    this.setjson = function(json) {
        this.json = json;
    };
    this.clear = function() {
        $("#" + this.id)
            .jstree()
            .destroy();
    };
    this.open = function(id) {
        var obj = $("#" + id).jstree();
        obj.open_node(id);
    };
    this.add = function(name, data, parent_id, id, cb) {
        if (parent_id === undefined) {
            parent_id = this.id;
        }
        if (id === undefined) {
            this.count++;
            id = this.id + "_" + this.count;
        }
        this.createNode(parent_id, id, name, "last", cb);
        $("#" + id).data("nodedata", data);
        return id;
    };
    this.redraw = function() {
        $("#" + this.id)
            .jstree()
            .redraw();
    };
    this.createNode = function(
        parent_id,
        new_node_id,
        new_node_text,
        position,
        cb
    ) {
        $("#" + parent_id).jstree(
            "create_node",
            $("#" + parent_id),
            { text: new_node_text, id: new_node_id },
            position,
            cb,
            false
        );
    };
    this.init();
};

Kom.appapi = {
    platform: "win32",
    is_browser: true,
    init: function() {
        var ua = window.navigator.userAgent;
        if (ua.match(/iPhone|iPad|iPod/gi)) {
            this.platform = "ios";
        } else if (ua.match(/MAC OS/gi)) {
            this.platform = "osx";
        } else if (window.localStorage !== undefined) {
            this.platform = "windows";
        }
        if (ua.match(/KomatsuEdge/)) {
            this.is_browser = false;
        }
        window.addEventListener("message", this.on_message, false);
    },
    on: function(reply, callback) {
        if ("function" != typeof callback) {
            return;
        }
        ipcRenderer.on(reply, function(e, result) {
            console.info("appapi.on", reply, result);
            callback(result);
        });
    },
    once: function(reply, callback) {
        if ("function" != typeof callback) {
            return;
        }
        ipcRenderer.once(reply, function(e, result) {
            console.info("appapi.once", reply, result);
            callback(result);
        });
    },
    call: function(message, params) {
        console.info("appapi.call", message, params);
        ipcRenderer.send(message, params);
    }
};
Kom.appapi.init();

Kom.sql = {
    init: function() {
        var self = this;
        if (Kom.appapi.is_browser) {
        } else {
            Kom.appapi.on("query-sql-cb", function(param) {
                if ("function" != typeof self.cb) {
                    return;
                }
                if (param.err !== undefined) {
                    self.cb(true, param);
                } else {
                    self.cb(false, param);
                }
            });
        }
    },
    query: function(args, cb) {
        this.cb = cb;
        Kom.appapi.call("query-sql", args);
    },
    setConnectInfo: function(args) {
        args.type = "setConnectInfo";
        this.query(args);
    },
    test: function() {
        this.query({ type: "getCarAndDate" });
    },
    export: function() {
        this.query({ type: "export" });
    },
    testdata: function() {
        this.query({
            type: "getDataWithCarAndDate",
            serialno: "100244",
            startDate: "2018/06/04",
            endDate: "2018/06/04"
        });
    }
};

Kom.sql.init();
