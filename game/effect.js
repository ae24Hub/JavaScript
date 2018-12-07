"use strict";

var EffectFindStar = enchant.Class.create(UnitySprite, {
  initialize:function(x,y){
    UnitySprite.call(this, 'solo_found_star', x, y);
    this.scale(40, 40);
    this.opacity = 0.02;
    
    if(app.fps>game.actualFps){
      this._speed = [0.4, 1.15, 0.4];
      this._limit = [1,3,1];
    }else{
      this._speed = [0.8, 1.15, 0.8];
      this._limit = [1,5,1];
    }
    
    this.num = 0;
  },
  onenterframe: function(){
    if(this.num < this._limit.length){
      this.scale(this._speed[this.num], this._speed[this.num]);
      this.opacity += 0.5;

      if(Math.abs(this.scaleX - this._limit[this.num]) < 0.5){
        this.num++;
      }
    }else{
      this.scaleX = 1;this.scaleY = 1;
    }
  }
});

var EffectWrongOne = enchant.Class.create(enchant.Sprite, {
  onadded:function(){
    var self = this;
    this.tl.
      fadeIn(this.p_lifetime/2).and().scaleBy(2, this.p_lifetime).and().moveBy(this.dx/2, this.dy/2, this.p_lifetime).and().rotateBy(this.rot/2, this.p_lifetime).
      scaleBy(2, this.p_lifetime).and().moveBy(this.dx/2, this.dy/2, this.p_lifetime).and().rotateBy(this.rot/2, this.p_lifetime).and().fadeOut(this.p_lifetime).
      exec(function(){self.parentNode.removeChild(self);});
  }
});

var EffectWrongAreaTap = enchant.Class.create(enchant.Group, {
  duration: 3, // [s]
  initialize: function(x,y) {
    enchant.Group.call(this);
    this.touchEnabled = false;
    this.moveTo(x, y);
    //this.spawn(12);
    this.spawn_cnt=0;
    this.effect_fps = (app.fps>game.actualFps)?game.actualFps:app.fps;
  },
  moveTo: function(x,y) {
    this.x = x;
    this.y = y;
  },
  onenterframe: function() {
    if(this.duration<this.age/this.effect_fps && 0>=this.childNodes.length) {
      this.parentNode.removeChild(this);
    }
    if(this.spawn_cnt < 2){
      for(var i=0;i<5;i++){
      this.addChild(new EffectWrongOne(0,0,{
            speed: 50,
            rotation: 1
          }));
      }
      this.spawn_cnt++;
    }
  },
  spawn: function(num) {
    var self=this;
    for(var i = 0; i < num; i++){
      var wait = 500*Math.pow(Math.random(),4);
      setTimeout(function(){
        self.addChild(new EffectWrongOne(0,0,{
          speed: 50,
          rotation: 1
        }));
      }, wait);
    }
    return num;
  },
});

var EffectPlusSecond = enchant.Class.create(enchant.Group, {
  duration: 1, // [s]
  initialize: function(x,y) {
    enchant.Group.call(this);
    this.touchEnabled = false;
    this.moveTo(x, y);
    //this.spawn(10);
    this.spawn_cnt=0;
    this.effect_fps = (app.fps>game.actualFps)?game.actualFps:app.fps;
  },
  moveTo: function(x,y) {
    this.x = x;
    this.y = y;
  },
  onenterframe: function() {
    if(this.duration<this.age/this.effect_fps && 0>=this.childNodes.length) {
      this.parentNode.removeChild(this);
    }
    
    if(this.spawn_cnt < 2){
      for(var i=0;i<3;i++){
        this.addChild(new EffectWrongOne(0,0,{
          speed: 25,
          rotation: 1,
          frame: 0
        }));
      }
      this.spawn_cnt++;
    }
  },
  spawn: function(num) {
    var self=this;
    for(var i = 0; i < num; i++){
      var wait = 50*Math.pow(Math.random(),4);
      setTimeout(function(){
        self.addChild(new EffectWrongOne(0,0,{
          speed: 25,
          rotation: 1,
          frame: 0
        }));
      }, wait);
    }
    return num;
  }
});



var EffectLifeDisappear = enchant.Class.create(enchant.Group, {
  lifeEffect: enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y){
      var image = game.assets['effect_lifeEffect'];
      enchant.Sprite.call(this, image.width, image.height);
      this.image = image;
    this.effect_fps = (app.fps>game.actualFps)?game.actualFps:app.fps;
      this.x=x;
      this.y=y;
      this._lifetime = this.effect_fps * 3/4;
      var p_lifetime = this._lifetime/4;
      this.scale(1.5, 1.5);
      this.tl.rotateBy(720, this._lifetime// , enchant.Easing.QUAD_EASEOUT
                      ).and().scaleTo(0.2, this._lifetime).and().fadeOut(this._lifetime);
    }
  }),
  life: enchant.Class.create(enchant.Sprite, {
    initialize:function(options){
      var image = game.assets['effect_life'], rad, dx, dy;
      enchant.Sprite.call(this, image.width, image.height);
      this.image = image;
      this.opacity = 0;
      this.x=options.x; this.y=options.y;
      this.midx=options.midx;
      this.midy=options.midy;

      this._lifetime = options.lifetime;
      this._starttime = options.start_delay;
      this._startsize = Random.range(15, 30)/100;

      rad = Math.random() * 360;
      dx=Number(this.x-this.midx); dy=Number(this.y-this.midy);
      this._gx = dx * options.speed_per_fps / this._lifetime;
      this._gy = dy * options.speed_per_fps / this._lifetime;
      this.scale(this._startsize);
      this.tl.delay(this._starttime).show()
        .scaleTo(1, this._lifetime, enchant.Easing.SIN_EASEOUT).and().fadeOut(this._lifetime,enchant.Easing.SIN_EASEOUT).and().rotateBy(-360, this._lifetime).and().moveBy(this._gx, this._gy, this._lifetime);
    }
  }),
  initialize: function(x,y,options) {
    var i, rad;
    enchant.Group.call(this);
    this.effect_fps = (app.fps>game.actualFps)?game.actualFps:app.fps;

    this.lifeeffect = new this.lifeEffect(x, y);
    this.addChild(this.lifeeffect);
    this.midx = this.lifeeffect.x + this.lifeeffect.width/2;
    this.midy = this.lifeeffect.y + this.lifeeffect.height/2;

    this._lifeduration = 0;
    this._frameCnt = 0;
    this._lifeframe = this.effect_fps * 3;
    this._liferest = 30;

    this.effect = [];
    this.effect[0] = {start_delay:this.effect_fps*3/4, lifetime:this.effect_fps*3/5, speed_per_fps:10, min_size:0.1, max_size:0.3 ,rest:30, rate:30, radius:0.5, midx:this.midx, midy:this.midy};

    if(options.loop === true){
      this.loop = true;
      this.origx = x; this.origy = y;
    }
  },
  onenterframe: function() {
    this._frameCnt++;
    for(var i = 0; i < this.effect.length; i++){
      var effect = this.effect[i];
      var px, py;
      if(// this._frameCnt > this._lifeduration &&
         effect.rest > 0){
        px = this.lifeeffect.x + this.lifeeffect.width/2 * Math.random();
        py = this.lifeeffect.y + this.lifeeffect.height/2 * Math.random();
        // this.addChild(new this.life(px, py, effect.midx, effect.midy, 3));
        effect.x = px; effect.y = py;
        this.addChild(new this.life(effect));
        effect.rest--;
      }
      if(this._frameCnt > this._lifeframe) {
        this.parentNode.removeChild(this);
        if(this.loop){
	      game.currentScene.addChild(new EffectLifeDisappear(this.origx, this.origy, {loop:true}));
        }
      }
    }
  },
  moveTo: function(x,y) {
    this.x = 512 + x;
    this.y = 288 - y;
  }
});

var EffectScoreUp = enchant.Class.create(enchant.Group, {
  EffectStar: enchant.Class.create(enchant.Sprite, {
    makestar: function() {
      var name,color,image;
      switch(~~(Math.random()*2)){
      case 0:
        name="star8";
        break;
      case 1:
        name="star5";
        break;
      }
      switch(~~(Math.random()*4)){
      case 0:
        color="red";
        break;
      case 1:
        color="rgb(255,255,0)";
        break;
      case 2:
        color="blue";
        break;
      case 3:
        color="green";
        break;
      case 4:
        color="rgb(0,255,244)";
        break;
      case 5:
        color="rgb(0,127,255)";
        break;
      }
      image=loadeffect(name,color);
      image.opacity = 0;
      return image;
    },
  initialize: function(x, y){
    enchant.Group.call(this);
    var glow = new EffectGlow(0,0);
    this.x = x, this.y = y;
    this.duration = 0;
    this.addChild(glow);
    this.effect_fps = (app.fps>game.actualFps)?game.actualFps:app.fps;
    this.effect = [];
    this.effect[0] = {x:-64, y:-64, midx:x, midy:y, life_time:this.effect_fps*3/4, speed_per_fps:0.35, max_particles:30};
    this.particles = 0;
  },
  onenterframe: function(){
    if(this.age > this.duration && this.particles < this.effect[0].max_particles){
      this.duration += this.effect[0].life_time/this.effect_fps;
      var rad = Math.random() * 360;
      var gx = Math.cos(rad) * 100 - 50;
      var gy = Math.sin(rad) * 100 - 50;
      this.effect[0].gx = gx; this.effect[0].gy = gy;
      this.addChild(new this.EffectStar(this.effect[0]));
      this.particles++;
    }
    if(this.particles === this.effect[0].max_particles && this.childNodes.length === 0){
      this.parentNode.removeChild(this);
    }
  }
});

var loadeffect=function(type,color){
  var makestar=function(count,x,y,r1,r2,color){
    var image=new enchant.Surface(r1*2,r1*2),
        cnt;
    count*=2;

    image.context.beginPath();
    image.context.moveTo(x + r2 * Math.sin(0),y + r2 * Math.cos(0));
    var angle = 2 * Math.PI / count;
    for (cnt = 1; cnt < count; cnt++) {
      if (cnt % 2 == 0) {
        image.context.lineTo(x + r2 * Math.sin(angle*cnt),y + r2 * Math.cos(angle*cnt));
      } else {
        image.context.lineTo(x + r1 * Math.sin(angle*cnt),y + r1 * Math.cos(angle*cnt));
      }
    }
    image.context.clip();
    image.context.fillStyle = color;
    image.context.fillRect(0,0,image.width,image.height);
    return image;
  };
 
  if (type=="star5"){
    return makestar(5,64,64,64,36,color);
  }else if (type=="star4"){
    return makestar(4,64,64,64,13,color);
  }else if (type=="star8"){
    return makestar(8,64,64,64,13,color);
  }else if (type=="heart"){
    return makeheart(64,64,64,color);
  }else if (type=="paper"){
    return makepaper(64,64,64,color);
  }
};
