window.yx = {
  g:function(name){
    return document.querySelector(name);
  },
  ga:function(name){
    return document.querySelectorAll(name);
  },
  addEvent:function(obj,ev,fn){
    if(obj.addEventListener){
      obj.addEventListener(ev,fn);
    }else{
      obj.attachEvent('on'+ev,fn);
    }
  },
  removeEvent:function(obj,ev,fn){
    if(obj.removeEventListener){
      obj.removeEventListener(ev,fn);
    }else{
      obj.detachEvent('on'+ev,fn);
    }
  },
  getTopValue:function(obj){//获取元素离html的距离
    var top=0;
    while(obj.offsetParent){
      top += obj.offsetTop;
      obj = obj.offsetParent;
    }
    return top;
  },
  cutTime:function (target) {//倒计时
    var currentDate = new Date();
    var v = Math.abs(target-currentDate);
    
    return {
      d:parseInt(v/(24*3600000)),
      h:parseInt(v%(24*3000000)/3600000),
      m:parseInt(v%(24*3000000)%3600000/60000),
      s:parseInt(v%(24*3000000)%3600000%60000/1000)
    };
  },
  format:function(v) {//给时间补0
    return v<10?'0'+v:v
  },
  formatDate:function(time){
    var d = new Date(time);
    return d.getFullYear()+'-'+yx.format(d.getMonth()+1)+'-'+yx.format(d.getDate())
    +' '+yx.format(d.getHours())+':'+yx.format(d.getMinutes());
  },
  parseURL:function(url) {   //把URL后的参数解析成对象
    //id = 123455
    var reg = /(\w+)=(\w+)/gi;
    var res  = {};
    url.replace(reg,function(a,b,c) {
      res[b]=c;
    })
    return res;
  },
  public:{
    navFn:function(){//导航功能
      var nav = yx.g('.nav');
      var lis = yx.ga('.navBar li');
      var subNav = yx.g(".subNav");
      var uls = yx.ga(".subNav ul");
      var newLis = [];//存储实际有用的li
      //从1开始是因为第一个为active，-3是因为
      for(var i=1;i<lis.length-3;i++){
        newLis.push(lis[i]);
      }
      for(var i=0;i<newLis.length;i++){
        newLis[i].index = uls[i].index = i;
        newLis[i].onmouseenter = uls[i].onmouseenter = function(){
          newLis[this.index].className = 'active';
          subNav.style.opacity = 1;
          uls[this.index].style.display = 'block';
        };
        newLis[i].onmouseleave = uls[i].onmouseleave = function(){
          newLis[this.index].className = '';
          subNav.style.opacity = 0;
          uls[this.index].style.display = 'none';
        };
      }
      yx.addEvent(window,'scroll',setNavPos);
      setNavPos();
      function setNavPos(){
        nav.id = window.pageYOffset>nav.offsetTop ? 'navFix':'';
      }
    },

    shopFn(){//购物车功能
      //localstorage()
      // localStorage.setItem('name','lily');
      // localStorage.clear();
      // console.log(localStorage);

      //购物车添加商品
      var productNum = 0;//购物车数量
      (function(local){
        var totalPrice = 0;//商品合计
        var ul = yx.g('.cart ul');
        var li='';
        ul.innerHTML = '';

        for(var i=0;i<local.length;i++){
          var attr = local.key(i);//取到每个key
          var value = JSON.parse(local[attr]);//JSON转换为JavaScript

          if(value&&value.sign=='productLocal'){  
            //这个条件成立，说明现在拿到的local是我们主动添加的local
            li +='<li data-id='+value.id+'>'+
            '<a href="#" class="img"><img src="'+value.img+'"/></a>'+
            '<div class="message">'+
              '<p><a href="#">'+value.name+'</a></p>'+
              '<p>'+value.spec.join(' ')+' x'+value.num+'</p>'+
            '</div>'+
            '<div class="price">¥'+value.price+'.00</div>'+
            '<div class="close">X</div>'+
          '</li>';

          totalPrice +=parseFloat(value.price)*Number(value.num);
          }
        }

        ul.innerHTML = li;

        productNum = ul.children.length;
        yx.g('.cartWrap i').innerHTML = productNum;//更新商品数量
        yx.g('.cartWrap .total span').innerHTML = '￥'+totalPrice+'.00';


        //删除商品功能
        var closeBtns = yx.ga('.cart .list .close');
        for(var i=0;i<closeBtns.length;i++){
          closeBtns[i].onclick = function(){
            localStorage.removeItem(this.parentNode.getAttribute('data-id'));

            yx.public.shopFn();//更新购物车页面

            if(ul.children.length==0){
              yx.g('.cart').style.display='none';
            }
          };
        }
        //给小红圈添加事件
        var cartWrap = yx.g('.cartWrap');
        var timer;


          cartWrap.onmouseenter = function(){
            clearTimeout(timer);
            // clearInterval(timer);
            yx.g('.cart').style.display ='block';
            scrollFn();
          };
          cartWrap.onmouseleave = function(){
            timer = setTimeout(function(){
              yx.g('.cart').style.display = 'none';
            },100);
          };
        

      })(localStorage);//！！！！



      //自定义购物车滚动条    后期可改成组件
      scrollFn();
      function scrollFn(){
        var contentWrap=yx.g('.cart .list');
        var content=yx.g('.cart .list ul');
        var scrollBar=yx.g('.cart .scrollBar');
        var slide = yx.g('.cart .slide');
        var slideWrap = yx.g('.cart .slideWrap');
        var btns = yx.ga('.scrollBar span');
        var timer;

        //倍数(滚动条高度)
        var beishu = content.offsetHeight/contentWrap.offsetHeight;
        scrollBar.style.display = beishu<1?'none':'block';//设置滚动条是否显示
        // 给倍数一下最大值
        if(beishu>20){
          beishu=20;
        }
        slide.style.height = slideWrap.offsetHeight/beishu+'px';//设置滑动条长度：

        // 滑块拖拽
        var scrollTop = 0;//滚动条走的距离
        var maxHeight = slideWrap.offsetHeight-slide.offsetHeight;//滑块能走的最大距离;offsetHeight可见区域高
        
        slide.onmousedown = function(ev){
          var disY = ev.clientY -slide.offsetTop;//offsetTop 指 obj 距离上方或上层控件的位置
          document.onmousemove = function(ev){
            scrollTop = ev.clientY-disY;
            scroll();
          };
          document.onmouseup = function(){
            this.onmousemove = null;
          }
          ev.cancelBubble = true;//取消冒泡
          return false;//取消一些默认事件
        };
        // 鼠标滚轮事件     !!!!
        myScroll(contentWrap,function(){
          scrollTop -= 10;
          scroll();
          // clearInterval(timer);
        },function(){
          scrollTop+=10;
          scroll();
          // clearInterval(timer);
        });

        //上下箭头点击事件
        for(var i=0;i<btns.length;i++){
          btns[i].index = i
          btns[i].onmousedown = function(){
            var n = this.index;
            timer = setInterval(function(){
              scrollTop = n?scrollTop+5:scrollTop-5;
              scroll();
            },16);
          };
          btns[i].onmouseup =function(){
            clearInterval(timer);
          }
        }

        // 滑块区域点击功能
        slideWrap.onmousedown = function(ev){
          timer = setInterval(function(){
            var slideTop = slide.getBoundingClientRect().top+slide.offsetHeight/2;
            if(ev.clientY<slideTop){
              //说明鼠标在滑块上方，滚动条往上走
              scrollTop-=5;
            }else{
              scrollTop+=5;
            }

            //如果插值的绝对值5，就认为到达终点，清掉定时器解决滚动条闪动问题
            if(Math.abs(ev.clientY-slideTop)<=5){
              clearInterval(timer);
            }
            scroll();
          },16);
        };


        //滚动条主体功能
        function scroll(){
          if(scrollTop<0){
            scrollTop = 0;
          }else if(scrollTop> maxHeight){
            scrollTop = maxHeight;
          }

          var scaleY = scrollTop/maxHeight;

          slide.style.top = scrollTop+'px';//滑动条的高度
          content.style.top = -(content.offsetHeight-contentWrap.offsetHeight)*scaleY+'px';//内容高度
        }
        //鼠标滚轮事件
        function myScroll(obj,fnUp,fnDown){
          obj.onmousewheel = fn;
          obj.addEventListener('DOMMouseScroll',fn);
          // 滚轮事件只有firefox比较特殊，使用DOMMouseScroll; 其他浏览器使用mousewheel;
          function fn(ev){
            if(ev.wheelDelta>0 || ev.detail<0){
              fnUp.call(obj);
            }else{
              fnDown.call(obj);
            }

            ev.preventDefault();
            return false;
          }
        }
      }

    },

    lazyImgFn:function(){//图片懒加载功能
      yx.addEvent(window,'scroll',delayImg);//监听事件，
      delayImg();
      function delayImg(){
        var originals = yx.ga('.original');//所有要懒加载的图片
        // console.log(originals);
        var scrollTop=window.innerHeight+window.pageYOffset;//可视区的高与滚动条的距离
      
        for(var i=0;i<originals.length;i++){
          //如果图片离html的上边的距离小于滚动条的距离与可视区的距离之和，就表示图片已经进入到可视区
          // console.log(yx.getTopValue(originals[i]),scrollTop);
          if(yx.getTopValue(originals[i])<scrollTop){
            originals[i].src = originals[i].getAttribute('data-original');
            // originals[i].removeAttribute('class');//如果该图片地址已更换，则把它身上的class去掉，就再也获取不到这张图片
          }
        }
        if(originals[originals.length-1].getAttribute('src')!='images/empty.gif'){
          //当最后一张图片被加载后，则不再监听
          yx.removeEvent(window,'scroll',delayImg);
          // console.log(originals[originals.length-1].getAttribute('src'));
          // console.log("取消监听");
        }
      }
    },

    backUpFn:function(){//回到顶部
      var back = yx.g('.back');
      var timer;
      back.onclick = function(){
        var top = window.pageYOffset;

        timer = setInterval(function(){
          top -=150;
          if(top<=0){
            top=0;
            clearInterval(timer);
          }
          window.scrollTo(0,top);
        },16);
      };

    }
  }
}