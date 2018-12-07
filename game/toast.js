/**
 * @name Toast
 * @class
 * Toast
 *
 * @constructs
 * @override
 */
var Toast = function(text) {
    this.toast = $("<div>");
    this.toast.addClass("toast")
              .css("position", "absolute");

    this.text = text;
    this.textLabel = {};
    this.textLabel.font = "20px Palatino";
    this.textLabel.color = "white";

    // textのwidthとheightを調べる
    var mesureBox = $("<span>");
    mesureBox.append(text)
             .css({
                 "font" : this.textLabel.font,
                 "visibility" : "hidden"
             });
    $("body").append(mesureBox);
    this.textLabel.height = mesureBox.height();
    this.textLabel.width = mesureBox.width();
    mesureBox.remove();

    //---------------
    // 黒背景作成
    //---------------
    var plateSurface = $("<div>");
    plateSurface
        .addClass("surface")
        .css({
            "height" : this.textLabel.height + 15 + "px",
            "width" : this.textLabel.width + 20 + "px",
            "background" : "#000",
            "position" : "relative",
            "text-align" : "center",
            "display" : "table"
        });
    this.toast.append(plateSurface);

    //---------------
    // テキスト作成
    //---------------
    var textArea = $("<div>");
    textArea
        .addClass("textArea")
        .append(this.text)
        .css({
            "font" : this.textLabel.font,
            "color" : this.textLabel.color,
            "vertical-align" : "middle",
            "display" : "table-cell"
        });

    plateSurface.append(textArea);

    var toastLeft = "";
    var toastTop  = "";
    if (Util.isIPad()) {
        toastLeft = screen.width  * 0.7 + "px";
        toastTop  = screen.height * 0.4  + "px";
    } else {
        toastLeft = screen.width  * 1.35 + "px";
        toastTop  = screen.height * 0.45  + "px";
    }

    // 位置調整
    this.toast.css({
        "position":"absolute",
        "width":"210px",
        "margin" : "auto",
        "left" : 0,
        "right" : 0,
        "top"  : toastTop,
        "opacity" : 0,
        "z-index" : 999
    });
    // 画面に追加
    $("body").append(this.toast);

    // 画面回転時に位置計算し直す
    $(window).on("orientationchange", function() {
        $("div.toast").css({
            "left" : toastLeft,
            "top"  : toastTop
        });
    });
};

Toast.prototype = {
    onenterframe: function() {
        var fps = 30;
        var opacity = 0;
        var age = 1;
        var _this = this;

        var fadeIn = null;
        var fadeOut = null;

        var enterframeIn = function() {
            /*age += fps/10;
            if(age >= fps * 3) {
                clearInterval(fadeIn);
                fadeOut = setInterval(enterframeOut, 1000/(fps/2));
            }*/
            if(opacity === 0) {
                setTimeout(function() {
                    clearInterval(fadeIn);
                    fadeOut = setInterval(enterframeOut, 1000/(fps/2));
                }, 3000);
            }
            if(opacity < 1) {
                opacity += 0.1;
                _this.toast.css("opacity", opacity);
            }
        };
        var enterframeOut = function() {
            opacity -= 0.1;
            _this.toast.css("opacity", opacity);
            if(opacity <= 0) {
                _this.toast.remove();
                clearInterval(fadeOut);
            }
        };

        fadeIn = setInterval(enterframeIn, 1000/(fps/2));
    }
};

window.Toast = Toast;
