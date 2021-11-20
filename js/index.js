//公用方法调用
yx.public.navFn();
yx.public.lazyImgFn();
yx.public.backUpFn();
yx.public.shopFn();

//banner轮播图
var bannerPic = new Carousel();
bannerPic.init({
  id : 'bannerPic',                 //轮播图父级的id,必需传的参数
  autoplay : true,            //自动播放，true为自动
  intervalTime : 3000,        //间隔时间，运动后停顿的时间
  loop : true,                //循环播放，
  totalNum : 5,               //图片总量
  moveNum : 1,                //单次运动的图片数量（图片总量必须为运动数量的倍数）
  circle : true,              //小圆点功能，
  moveWay : 'opacity'         //运动方式，opacity为透明过渡、position为位置过渡
});


//新品首发轮播
var newProduct = new Carousel();
newProduct.init({
  id : 'newProduct',                 //轮播图父级的id,必需传的参数
  autoplay : false,            //自动播放，true为自动
  intervalTime : 3000,        //间隔时间，运动后停顿的时间
  loop : false,                //循环播放，
  totalNum : 8,               //图片总量
  moveNum : 4,                //单次运动的图片数量（图片总量必须为运动数量的倍数）
  circle : false,              //小圆点功能，
  moveWay : 'position'         //运动方式，opacity为透明过渡、position为位置过渡
});


//自定义事件
newProduct.on('rightEnd',function(){
  this.nextBtn.style.background = '#E7E2D7';
});
newProduct.on('leftEnd',function(){
  this.prevBtn.style.background = '#E7E2D7';
});
newProduct.on('leftClick',function(){
  this.nextBtn.style.background = '#D0C4AF';
});
newProduct.on('rightClick',function(){
  this.prevBtn.style.background = '#D0C4AF';
});

//人气推荐选项卡
(function(){//自制型函数  ，形成局部作用域，这里面对外边不会产生影响
  var titles = yx.ga('#recommend header li');
  var contents = yx.ga('#recommend .content');

  for(var i=0;i<titles.length;i++){
    titles[i].index = i;
    titles[i].onclick = function(){
      for(var j=0;j<titles.length;j++){
        titles[j].className = '';
        contents[j].style.display = 'none';
      }
      titles[this.index].className = 'active';
      contents[this.index].style.display = 'block';
    };
  }
})();

//限时购
(function(){
  var timeBox = yx.g('#limit .timeBox');
  var spans = yx.ga('#limit .timeBox span');
  var timer = setInterval(showTime,1000);
  // console.log("限时购");
  showTime();
  //倒计时
  function showTime(){
    var endTime = new Date(2021,6,4,22);
    if(new Date()<endTime){//若当前时间没有超过结束时间才去做倒计时
      var overTime = yx.cutTime(endTime);
      spans[0].innerHTML = yx.format(overTime.h);
      spans[1].innerHTML = yx.format(overTime.m);
      spans[2].innerHTML = yx.format(overTime.s);
    }else{
      clearInterval(timer);
    }
  }
  //更新、获取商品数据
  var boxWrap = yx.g('#limit .boxWrap');
  var str = '';
  var item = json_promotion.itemList;

  for(var i=0;i<item.length;i++){
    str += '<div class="limitBox">'+
    '<a href="#" class="left scaleImg"><img class="original" src="images/empty.gif" data-original="'+item[i].primaryPicUrl+'"/></a>'+
    '<div class="right">'+
      '<a href="#" class="title">'+item[i].itemName+'</a>'+
      '<p>'+item[i].simpleDesc+'</p>'+
      '<div class="numBar clearfix">'+
        '<div class="numCon"><span style="width:'+Number(item[i].currentSellVolume)/Number(item[i].totalSellVolume)*100+'%"></span></div>'+
        '<span class="numTips">还剩'+item[i].currentSellVolume+'件</span>'+
      '</div>'+
      '<div>'+
        '<span class="xianshi">限时价<span class="fuhao">¥</span><strong>'+item[i].actualPrice+'</strong></span>'+
        '<span class="yuan">原价 ¥'+item[i].retailPrice+'</span>'+
      '</div>'+
      '<a href="#" class="qianggou">立即抢购</a>'+
    '</div>'+
  '</div>';
  }
  boxWrap.innerHTML = str;
})();

//大家都在说 轮播图
var say = new Carousel();
say.init({
  id : 'sayPic',                 //轮播图父级的id,必需传的参数
  autoplay : true,            //自动播放，true为自动
  intervalTime : 3000,        //间隔时间，运动后停顿的时间
  loop : true,                //循环播放，
  totalNum : 3,               //图片总量
  moveNum : 1,                //单次运动的图片数量（图片总量必须为运动数量的倍数）
  circle : false,              //小圆点功能，
  moveWay : 'position'         //运动方式，opacity为透明过渡、position为位置过渡
})