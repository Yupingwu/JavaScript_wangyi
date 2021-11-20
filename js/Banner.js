// 轮播图组件
// 组件api说明
// 1.依赖move.js，组件前一定要引入move.js
// 2.轮播图需要有一个父级，这个父级一定要给一个id
;(function(window,undefined){
  var Carousel = function(){
    this.settings = {
      id : 'pic',                 //轮播图父级的id,必需传的参数
      autoplay : true,            //自动播放，true为自动
      intervalTime : 1000,        //间隔时间，运动后停顿的时间
      loop : true,                //循环播放，
      totalNum : 5,               //图片总量
      moveNum : 1,                //单次运动的图片数量（图片总量必须为运动数量的倍数）
      circle : true,              //小圆点功能，
      moveWay : 'opacity'         //运动方式，opacity为透明过渡、position为位置过渡
    };
  };

  Carousel.prototype = {
    constructor : Carousel,
    init : function(opt){
      var opt = opt || this.settings;

      for(var attr in opt){
        this.settings[attr] = opt[attr];
      }
      this.createDom();
    },
    createDom:function(){//创建结构
      var _this = this;//_this指向createDom
      this.box = document.getElementById(this.settings.id);
      //创建上一个按钮
      this.prevBtn = document.createElement("div");
      this.prevBtn.className = 'prev';
      this.prevBtn.innerHTML = '<';
      this.prevBtn.onclick = function(){
        _this.prev();
        _this.trigger('leftClick');
      };
      this.box.appendChild(this.prevBtn);

      //创建下一个按钮
      this.nextBtn = document.createElement("div");
      this.nextBtn.className = 'next';
      this.nextBtn.innerHTML = '>';
      this.nextBtn.onclick = function(){
        _this.next();
        _this.trigger('rightClick');
      };
      this.box.appendChild(this.nextBtn);

      //创建圆点
      this.circleWrap = document.createElement("div");
      this.circleWrap.className = 'circle';
      this.circles = [];//存圆点

      //创建多少个圆点？图片数量除以要走图片的数量
      for(var i=0;i<this.settings.totalNum/this.settings.moveNum;i++){
        var span = document.createElement("span");
        span.index = i;
        span.onclick = function(){
          _this.cn = this.index;
          _this[_this.settings.moveWay + 'Fn']();
        };
        this.circleWrap.appendChild(span);
        this.circles.push(span)
      }
      this.circles[0].className = 'active';

      if(this.settings.circle){
        this.box.appendChild(this.circleWrap);
      }
      this.moveInit();//创建完元素，就执行运动方法
    },
    moveInit:function(){        //运动初始化功能
      this.cn = 0;             //当前的索引
      this.ln = 0;             //上一索引
      this.canClick = true;    //是否可以再次点击
      this.endNum = this.settings.totalNum/this.settings.moveNum;//终止条件
      this.opacityItem = this.box.children[0].children;          //运动透明度的元素
      this.positonItemWrap = this.box.children[0].children[0];//运动位置的元素的父级
      this.positonItem = this.positonItemWrap.children;//运动位置的所有元素

      switch(this.settings.moveWay){
        case 'opacity':  //如果走的是透明度过渡，需要设置透明度和transition
          for(var i=0;i<this.opacityItem.length;i++){
            this.opacityItem[i].style.opacity = 0;
            this.opacityItem[i].style.transition = '.3s opacity';
          }
          this.opacityItem[0].style.opacity = 1;
          break;
        case 'position':   //走的是位置，需设置父级宽度，
        //注意：一定要加上元素的margin
        var leftMargin = parseInt(getComputedStyle(this.positonItem[0]).marginLeft);
        var rightMargin = parseInt(getComputedStyle(this.positonItem[0]).marginRight);
        //一个运动元素的实际宽度
        this.singleWidth = leftMargin + this.positonItem[0].offsetWidth + rightMargin;
        //如果运动是循环的，需要复制一份内容
        if(this.settings.loop){
          this.positonItemWrap.innerHTML += this.positonItemWrap.innerHTML;
        }

        //复制内容后才能设置宽度
        this.positonItemWrap.style.width = this.singleWidth*this.positonItem.length + 'px';
      }
      if(this.settings.autoplay){
        this.autoPlay();
      }
    },
    opacityFn:function(){//透明度运动方式
      //运动判断 左边到头
      if(this.cn<0){
        if(this.settings.loop){
          //循环
          this.cn = this.endNum-1;
        }else{
          this.cn=0;
          this.canClick = true;  //解决点击头一张或者最后一张，不能再次点击的问题。因为canClick
          // 是在transitionend里面设置的，如果不循环的话就会停在最后，再次点击的时候transitionend就不会发生，所以canclick的值就不会改变
        }
      }
      //右边到头
      if(this.cn>this.endNum-1){
        if(this.settings.loop){
          //循环
          this.cn = 0;
        }else{
          this.cn=this.endNum-1;
          this.canClick = true;  
        }
      }

      this.opacityItem[this.ln].style.opacity = 0;
      this.circles[this.ln].className='';

      this.opacityItem[this.cn].style.opacity = 1;
      this.circles[this.cn].className = 'active';

      var en =0 ;
      var _this = this;
      this.opacityItem[this.cn].addEventListener('transitionend',function(){//transitionend 事件在 CSS 完成过渡后触发。
        en++;
        if(en==1){//此监听事件会多次触发，因此这里只要触发一次
          _this.canClick = true;
          _this.ln = _this.cn;

          _this.endFn();   //调用自定义事件
        }
      });
   
    },
    positionFn:function(){
      //左边到头
      if(this.cn<0){
        if(this.settings.loop){
          //循环
          /* 在这里需做两件事
            1. 先让运动的父级的位置到中间，为了往右走不会出现空白
            2. 同时需要修改索引值(到了中间了，并不是停在那儿了，而是需要运动出前一排，所以cn的值要减1，就是为了能运动)
          */
         this.positonItemWrap.style.width = -this.positonItemWrap.offsetWidth/2 +'px';
         this.cn = this.endNum-1;
        }else{
          this.cn = 0;
        }
      }
      //右边到头
      if(this.cn>this.endNum-1){
        if(this.settings.loop){
          //循环，这里不用做任何处理，需要在运动结束后去做条件判断
        }else{
          this.cn = this.endNum-1;
        }
      }

      //设置圆点的条件：只有不循环时才去修改圆点
      if(!this.settings.loop){
        this.circles[this.ln].className ='';
        this.circles[this.cn].className = 'active';
      }
      //运动
      //left的值，=一个元素的宽度*当前cn的值*一次运动元素的个数
      var _this = this;
      move(this.positonItemWrap,{left:-this.cn*this.singleWidth*this.settings.moveNum},
        300,'linear',function(){//这个function是个回调函数
          //当走到第二份的第一屏的时候就需要让运动的父级的left值变成0
          if(_this.cn == _this.endNum){
            //说明此时已经走到第二份的第一屏
            _this.cn = 0;
          }

          _this.endFn();            //调用自定义事件

          _this.ln = _this.cn;
          _this.canClick = true;
        });
    },
    prev:function(){//上一个按钮点击功能
      //能否进行下一次点击，在此进行判断
      if(!this.canClick){
        return;
      }
      this.cn--;
      this[this.settings.moveWay+'Fn']();//positionFn函数调用，this.settings.moveWay是变量所以放在中括号中
    },
    next:function(){//下一个按钮点击功能
      if(!this.canClick){
        return;
      }
      this.cn++;
      this[this.settings.moveWay+'Fn']();
    },
    autoPlay:function(){   //轮播图自动播放
      var _this = this;
      this.timer = setInterval(function(){
        _this.next();

      },this.settings.intervalTime);

      //鼠标移入移出效果
      this.box.onmouseenter = function(){
        clearInterval(_this.timer);
        _this.timer = null;
      };
      this.box.onmouseleave = function(){
        _this.autoPlay();
      }
    },
    on:function(type,listener){//添加自定义事件
      this.events = this.events||{};
      this.events[type]= this.events[type]||[];
      this.events[type].push(listener);
    },
    trigger:function(type){//调用自定义事件
      //有的组件有自定义事件，有的没有，所以需判断，只有调用自定义事件的实例才能执行下面的代码
      if(this.events && this.events[type]){
        for(var i=0;i<this.events[type].length;i++){
          this.events[type][i].call(this);//这个this指向trigger

        }
      }
    },
    endFn:function(){
      //添加自定义事件的函数，要在运动完后添加。并且需要加给不循环的运动
      if(!this.settings.loop){
        if(this.cn==0){//左边到头
        this.trigger('leftEnd');
        }
        if(this.cn == this.endNum-1){
          this.trigger('rightEnd');
        }
      }
    }

  };

  window.Carousel = Carousel;//将Carousel函数设置成全局函数
})(window,undefined);