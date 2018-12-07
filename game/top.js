/**
 * タイトル画面
 * メインメニュー画面
 */

var ToggleButton = enchant.Class.create(enchant.Sprite, {
    initialize: function(on,off,x,y,cb,onoff) {
      this._on=game.assets[on];
      this._off=game.assets[off];
      this._isenable=onoff;
  
      enchant.Sprite.call(this,this._on.width,this._on.height);
  
      this.refresh();
  
      this.moveTo(x,y);
      this.cb=cb;
    },
    moveTo: function(x,y) {
      this.x=x-this.image.width*app.scale2u/2;
      this.y=y-this.image.height*app.scale2u/2;
    },
    refresh: function(){
      if (this._isenable){
        this.image=this._on;
      }else{
        this.image=this._off;
      }
    },
    ontouchstart: function(){
    },
    ontouchend: function(){
      this._isenable=!this._isenable;
      this.refresh();
      this.cb(this._isenable);
    },
  });
  
  var titleScene = enchant.Class.create(enchant.Scene, {
    initialize: function(){
      enchant.Scene.call(this);
      var self = this;
  
      this.backgroundColor = "black";
  
        this._bg=new enchant.Sprite(app.width,app.height);
        this._bg.image=game.assets['title_bg'];
        this.addChild(this._bg);
  
        this._bg=new enchant.Sprite(app.width,app.height);
        this._bg.image=game.assets['trial_title'];
        this.addChild(this._bg);
  
      this._hajimeru = new UnityButton("hajimeru_d","hajimeru_u",0,-170,function(){
        SoundManager.PlaySE();
        SoundManager.PlayBGM();
  
        SoundManager.PlayVoice("shima_title");
  
        var menu = new menuScene();
        game.replaceScene(menu);
      },false,true);
      this._modoru = new UnityButton("modoru_d","modoru_u",-512+130/2,288-80/2,function(){
        openDkids();
      },false,true);
  
      StageManager.update(game.assets["stage_config"], function(){
        self.addChild(self._hajimeru);
        self.addChild(self._modoru);
      });
    }
  });
  var menuScene = enchant.Class.create(enchant.Scene, {
    initialize: function(){
      enchant.Scene.call(this);
  
      this.backgroundColor = "black";
        this._bg=new enchant.Sprite(app.width,app.height);
      this._bg.image=game.assets['bg'];
        this.addChild(this._bg);
  
        this._machigai = new UnityButton("machigai_icon","machigai_icon",-90,-80,function(){
        app.redirect("machigai.html");
        });
        this.addChild(this._machigai);
      /*if(StageManager.isNewStage(gameType.machigai)){
        var mark =new UnitySprite("new_mark", -50, -36);
        mark.touchEnabled = false;
        this.addChild(mark);
      }*/
  
        this._kakurenbo = new UnityButton("trial_kakurenbo_icon","trial_kakurenbo_icon",180,155,function(){
        ErrorManager.TrialPopup();
        });
        this.addChild(this._kakurenbo);
      /*if(StageManager.isNewStage(gameType.kakurenbo)){
        mark =new UnitySprite("new_mark", 220, 199);
        mark.touchEnabled = false;
        this.addChild(mark);
      }*/