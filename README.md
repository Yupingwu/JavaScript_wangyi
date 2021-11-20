# JavaScript_wangyi
原生JS_网易严选商城，商品首页和详情页，两组件通过localstorage传递购物车数据

1、轮播图组件 Banner.js<br>
  // 组件api说明<br>
  // 1.依赖move.js，组件前一定要引入move.js<br>
  // 2.轮播图需要有一个父级，这个父级一定要给一个id<br>
```
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
  ```
  
  2、商品详情页 product.js<br>
  评论区分页和页码功能：<br>
  ```
   function creatPage(pn,tn){//pn显示页码数  tn数据总数
    var page = yx.g('.page');
    var totalNum = Math.ceil(tn/pn);  //最多能显示的页码数
    //若用户给的页数比总数还要大，就改成总数
    if(pn>totalNum){
      pn= totalNum;
    }
    page.innerHTML = '';

    var cn=0;//当前点击的页码的索引
    var spans = [];//把数字的页码都放在一个数组里，其他地方要用到
    var div = document.createElement('div');
    div.className = 'mainPage';

    //创建首页页码
    var indexPage=pageFn('首页',function(){
      //这个for循环作用,是为了避免点首页时，如此时为10、11、12、13、14、15、16，点首页跳到了10页
      //不用for循环的话，虽然showComment(10,0)函数做到页面内容显示第一页内容，
      // 但是 changePage()函数的页码切换不正确，它切到了cn=0的地方，即下标为0而不是页码为0
      for(var i=0;i<pn;i++){
        spans[i].innerHTML =i+1;
      }
      cn = 0;
      showComment(10,0);
      changePage();
    });
    if(indexPage){//避免页码的数量小于2 时，返回值为undefined，这里会报错
      indexPage.style.display = 'none';
    }
    
    var prevPage=pageFn('<上一页',function(){
     cn--;
    //  要做判断，因为如10的下标为0，此时cn--就不对了，
    if(cn<0){
      cn=0;
    }
     showComment(10,spans[cn].innerHTML-1);
     changePage();
    });
    if(prevPage){
      prevPage.style.display = 'none';
    }

    //创建数字页码
    for(var i=0;i<pn;i++){
      var span=document.createElement('span');
      span.index = i;//页码span的下标；【0，1，2，3，4，5，6，7，8，9】；
      span.innerHTML=i+1;
      spans.push(span);

      //给第一个页码加上class
      span.className = i?'':'active';

      // var ll = 0;
      span.onclick = function(){
        cn = this.index;
        showComment(10,this.innerHTML-1);
        changePage();
        // spans[ll].className = '';
        // this.className = 'active';
        // ll = cn;
      };
      div.appendChild(span);
    }
    page.appendChild(div);

    var nextPage=pageFn('下一页>',function(){
      if(cn<spans.length-1){
        cn++;
      }
      showComment(10,spans[cn].innerHTML-1);//为什么此处使用spans[cn].innerHTML-1而不是cn;
      // 因为cn是span下标，而spans[cn].innerHTML-1才是展示数据的真正页码，例11页的下标cn为1，10页为0；
      changePage();
    });
    var endPage=pageFn('尾页',function(){
      var end = totalNum;
      for(var i=spans.length-1;i>=0;i--){
        spans[i].innerHTML =end--;
      }
      cn = spans.length-1;
      showComment(10,totalNum-1);
      changePage();
    });

    //更新页码功能
    function changePage(){
      //此功能为什么要用函数？因为点击不同页码时，下面span会切换变化
      var cur = spans[cn];       //当前点击的那个页码
      var curInner = cur.innerHTML;//因为后面会修改，所以存一下当前页码的内容

      var differ = spans[spans.length-1].innerHTML-spans[0].innerHTML;//算出的差即为页码
      // 要增加或减少的数量，同时保证点击的那个页码会出现在更新后的页面

      //点击最后面页码，页码增加；
      if(cur.index == spans.length-1){
        if(Number(cur.innerHTML)+differ>totalNum){
          //若加上差值后的页码比总页码大，说明右边已经超过总页码了，需要重新设置差值
          differ = totalNum-cur.innerHTML;
        }
      }
      //点击前面页码，页码减少；
      if(cur.index == 0){
        if(Number(cur.innerHTML)-differ<1){
          //若减上差值后的页码比总页码大，说明右边已经到头了，需要重新设置差值
          differ = cur.innerHTML-1;
        }
      }
      for(var i=0;i<spans.length;i++){
        //点击时最后一个页码，则页码更新
        if(cur.index == spans.length-1){
          spans[i].innerHTML = Number(spans[i].innerHTML)+differ;
        }
        if(cur.index == 0){
          spans[i].innerHTML = Number(spans[i].innerHTML)-differ;
        }
        //设置class
        spans[i].className = '';
        if(spans[i].innerHTML == curInner){
          spans[i].className= 'active';
          cn = spans[i].index; //为什么有这步？当点击最后一页时，cn为10，点击后10页码跳到了1去，
          // 而10页码的下标还是10，此时var curInner = cur.innerHTML;处报错
          // 此时应该把10页码的下标修改为1；
        }
      }
      //显示与隐藏功能页码(当页面例有功能页码才去执行下面代码)
      if(pn>1){
        //点的是第一个页码，就让首页与上一页隐藏
        var dis = curInner ==1?'none':'inline-block';
        indexPage.style.display = prevPage.style.display = dis;

        //最后一个页码
        var dis = curInner ==totalNum?'none':'inline-block';
        nextPage.style.display = endPage.style.display = dis;        
      }
    }
    //创建页码的公用函数
    function pageFn(inner,fn){
      if(pn<2){
        return;
      }

      var span = document.createElement('span');
      span.innerHTML = inner;
      span.onclick = fn;
      page.appendChild(span);

      return span;//把创建的值翻出去
    }
  }
  ```
  
