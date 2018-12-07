"use strict";
/*
KomEdgeView data manager

*/

app.dataManager = {
    mode: "csv",
    savedata: {
        userId: "",
        dbhost: "",
        dbuser: "",
        dbpass: "",
        dbname: "",
        dbtable: "",
        dbsave: "0"
    },

    init: function() {
        var self = this;
        self.savedata = Kom.db.load("login", self.savedata);
        if (self.savedata.dbhost != "" && !Kom.appapi.is_browser) {
            self.mode = "db";
        }
        if (self.mode == "csv") {
            self.init_csv();
        } else {
            Kom.sql.setConnectInfo(self.savedata);
            self.init_db();
        }
    },
    init_db: function() {
        var self = this;

        $("#loading").show();
        Kom.sql.query({ type: "getCarAndDate" }, function(err, result) {
            $("#loading").hide();
            if (err) {
                alert(
                    "データベースとの接続でエラーが発生しました\n\nエラー：" +
                        result.err.message
                );
                location.href = "login.html";
                return;
            }
            self.date_range = [];
            for (var i in result.data) {
                var data = result.data[i];
                data.MinDate = Kom.util.parse_date(data.MinDate);
                data.MaxDate = Kom.util.parse_date(data.MaxDate);
                self.date_range.push(data);
            }
            Kom.event.send("onChangeCarAndDate", true);
        });
        /* 絞り込み条件が変更されたら呼ばれるイベント */
        Kom.event.onReceive("onPrepareData", function(tag, cur) {
            if (app.selectedCar.length == 0) {
                return;
            }
            if (
                app.date_min === undefined ||
                app.date_max === undefined ||
                app.date_min === "" ||
                app.date_max === ""
            ) {
                return;
            }
            if (app.date_min < 19000000 || app.date_max < 19000000) {
                return;
            }
            var serial_no = app.selectedCar[0].Serial_No;
            var startDate = Kom.util.date_fromint(app.date_min);
            var endDate = Kom.util.date_fromint(app.date_max);
            $("#loading").show();
            Kom.sql.query(
                {
                    type: "getDataWithCarAndDate",
                    serialno: serial_no,
                    startDate: startDate,
                    endDate: endDate
                },
                function(err, result) {
                    $("#loading").hide();
                    if (err) {
                        alert(
                            "データベースとの接続でエラーが発生しました\n\nエラー：" +
                                result.err.message
                        );
                        location.href = "login.html";
                        return;
                    }
                    self.db = result.data;
                    app.db = self.db;
                    if (self.db.length > 0) {
                        Kom.event.send("onChangeDB", true);
                        app.setData(0);
                    }
                }
            );
        });
    },
    init_csv: function() {
        var self = this;
        var tsvfile = Kom.file.matchIni(/tsv_name/)[0];
        Kom.file.loadTsv("db/" + tsvfile, true, function(data) {
            self.tsv = data;
            self.calcRange();
            // データに含まれる車種が１機種の場合のみ、デフォルト値とする
            if (self.date_range.length == 1) {
                //                app.selectedCar = self.date_range;
            }
            Kom.event.send("onChangeCarAndDate", true);
        });
        /* 絞り込み条件が変更されたら呼ばれるイベント */
        Kom.event.onReceive("onPrepareData", function(tag, cur) {
            if (app.selectedCar.length == 0) {
                return;
            }
            if (
                app.date_min === undefined ||
                app.date_max === undefined ||
                app.date_min === "" ||
                app.date_max === ""
            ) {
                return;
            }
            if (app.date_min < 19000000 || app.date_max < 19000000) {
                return;
            }
            self.setDBwithCarAndDate();
        });
        Kom.event.send("onResize", true);
    },
    /* TSVモードの場合はファイルから読み込んだデータを保存 */
    tsv: [],
    date_range: [],
    getRange: function(serialno) {
        for (var i in this.date_range) {
            if (this.date_range[i]["Serial_No"] == serialno) {
                return this.date_range[i];
            }
        }
        return undefined;
    },
    /* 日付範囲の取得 */
    calcRange: function() {
        var dict = {};
        for (var i = 0; i < this.tsv.length; i++) {
            var row = this.tsv[i];
            var company = row["Company"];
            var country = row["Country"];
            var model = row["Model"];
            var serialno = row["Serial_No"];
            var date = Kom.util.parse_date(row["Date"]);
            var time = Kom.util.parse_time(row["Time"]);
            if (dict[serialno] === undefined) {
                dict[serialno] = {
                    Serial_No: serialno,
                    Company: company,
                    Country: country,
                    Model: model,
                    MinDate: 99999999,
                    MaxDate: 0,
                    count: 0
                };
            }
            var car = dict[serialno];
            if (car["MinDate"] > date) {
                car["MinDate"] = date;
            }
            if (car["MaxDate"] < date) {
                car["MaxDate"] = date;
            }
            car["count"] += 1;
        }
        this.date_range = [];
        for (var i in dict) {
            this.date_range.push(dict[i]);
        }
    },
    /* 選択された日付と車種で絞り込み */
    setDBwithCarAndDate: function() {
        this.db = [];
        app.db = this.db;
        for (var i = 0; i < this.tsv.length; i++) {
            var date = Kom.util.parse_date(this.tsv[i]["Date"]);
            if (Kom.util.compare_date(date, app.date_min) == 1) {
                continue;
            }
            if (Kom.util.compare_date(app.date_max, date) == 1) {
                continue;
            }
            this.db.push(this.tsv[i]);
        }
        if (this.db.length > 0) {
            Kom.event.send("onChangeDB", true);
            app.setData(0);
        }
    }
};

Kom.onload.add(function() {
    app.dataManager.init();
});
