//公用方法调用
yx.public.navFn();
yx.public.backUpFn();

console.log(productList);

//解析URL
var params = yx.parseURL(window.location.href);
console.log(params);
var pageId = params.id;                 //产品名
var curData = productList[pageId];      //产品对应数据

console.log(params);
console.log(pageId);
console.log(curData);

if(!pageId||!curData){//404页面
  window.location.href= 'index.html';
  // window.location.href= '404.html';
}



//面包屑
var positionFn = yx.g('#position');
positionFn.innerHTML = '<a href="#">首页</a> >';
for(var i=0;i<curData.categoryList.length;i++){
  positionFn.innerHTML += '<a href="#">'+curData.categoryList[i].name+'</a> > ';
}
positionFn.innerHTML +=curData.name;

//产品图
(function() {
  //左边图片切换
  var bigImg = yx.g("#productImg .left img");
  var smallImgs = yx.ga('#productImg .smallImg img');

  bigImg.src = smallImgs[0].src = curData.primaryPicUrl;

  var last = smallImgs[0];//上一张图片
  for(var i=1;i<smallImgs.length;i++){
    smallImgs[i].src = curData.itemDetail['picUrl'+i];
    smallImgs[i].index = i;
    smallImgs[i].onmouseenter = function() {
      bigImg.src = this.src;
      last.className = '';
      this.className = 'active';
      last = this;
    }
  }
  // 右边信息更换
  yx.g('#productImg .info h2').innerHTML = curData.name;
  yx.g('#productImg .info p').innerHTML = curData.simpleDesc;
  yx.g('#productImg .info .price').innerHTML = '<div><span>售价</span><strong>¥'+curData.retailPrice+'.00</strong></div><div><span>促销</span><a href="#" class="tag">'+curData.hdrkDetailVOList[0].activityType+'</a><a href="#" class="discount">'+curData.hdrkDetailVOList[0].name+'</a>'+
  '</div><div><span>服务</span><a href="#" class="service"><i></i>30天无忧退货<i></i>48小时快速退款<i></i>满88元免邮费<i></i>网易自营品牌</a></div>';


  //创建Dom\
  var format = yx.g('#productImg .fomat');
  var dds=[];//把所有的dd标签存起来，为了后面要用
  for(var i=0;i<curData.skuSpecList.length;i++){
    var dl = document.createElement("dl");
    var dt = document.createElement("dt");
    dt.innerHTML = curData.skuSpecList[i].name;
    dl.appendChild(dt);

    for(var j=0;j<curData.skuSpecList[i].skuSpecValueList.length;j++){
      var dd = document.createElement("dd");
      dd.innerHTML = curData.skuSpecList[i].skuSpecValueList[j].value;
      dd.setAttribute('data-id',curData.skuSpecList[i].skuSpecValueList[j].id);

      dd.onclick = function(){//点击逻辑，是否有库存
        changeProduct.call(this);
      };
      dds.push(dd);
      dl.appendChild(dd);
    }
    // console.log(dl);
    format.appendChild(dl);
  }
  //点击规格功能
  function changeProduct(obj){
    //不能点击，则返回
    if(this.className.indexOf('noclick')!=-1){
      return;
    }
    var curId = this.getAttribute('data-id');  //点的那个ID
    var othersDd = [];//对方的dd,即可以操作的(型号/颜色)
    var mergeId = [];//用于点击id组合到所有ID（去查这个组合的余量

    //找对方DD以及组合后的id
    //数组里的key是：“点击ID，对方id”;所以只要能查到点的id，他就包含了所有对方的id
    for(var attr in curData.skuMap){
      if(attr.indexOf(curId)!=-1){//条件成立，则说明找到当前id能组合到的所有id
        //1132095;1132097
        var otherId = attr.replace(curId,'').replace(';','');

        for(var i=0;i<dds.length;i++){
          if(dds[i].getAttribute('data-id')==otherId){
            othersDd.push(dds[i]);
          }
        }
        mergeId.push(attr);    //把找到的所有组合的id放在数组里
      }
    }
    // console.log(othersDd,mergeId);
    //点击功能,此逻辑见OneNote
    var brothers = this.parentNode.querySelectorAll('dd');
    if(this.className=='active'){
      //选中状态
      this.className = '';

      for(var i=0;i<othersDd.length;i++){
        if(othersDd[i].className == 'noclick'){
          othersDd[i].className = '';
        }
      }
    }else{
      for(var i=0;i<brothers.length;i++){
        if(brothers[i].className=='active'){
          brothers[i].className= '';
        }
      }

      this.className = 'active';

      for(var i=0;i<othersDd.length;i++){
        if(othersDd[i].className == 'noclick'){
          othersDd[i].className = '';
        }
        if(curData.skuMap[mergeId[i]].sellVolume==0){
          othersDd[i].className = 'noclick';
        }
      }
    }
    addNum();
  }
  //数量加减功能
  addNum();
  function addNum(){
    var actives = yx.ga('#productImg .fomat .active');
    var btnParent = yx.g('#productImg .number div');
    var btns = btnParent.children;
    var ln = curData.skuSpecList.length;

    //当点击的长度等于规格数量，则全部选择完毕，可以选择数量了
    if(ln == actives.length){
      btnParent.className = '';
    }else{
      btnParent.className = 'noClick';
    }

    btns[0].onclick = function(){
      if(btnParent.className){
        return;
      }
      btns[1].value--;
      if(btns[1].value < 0){
        btns[1].value=0;
        btns[0].className = 'noClick';
      }
    };
    btns[1].onclick = function(){
      if(btnParent.className){
        //若父级不能点击，则输入框失去焦点
        this.blur();
      }
    };
    btns[2].onclick = function(){
      if(btnParent.className){
        return;
      }
      btns[1].value++;
    };
  }
})();

//加入购物车
(function(){
  yx.public.shopFn();

  var joinBtn = yx.g('#productImg .join');//加入购物车按钮
  joinBtn.onclick = function(){
    var actives = yx.ga('#productImg .fomat .active');
    var selectNum = yx.g('#productImg .number input').value;//用户选中数量
    if(actives.length<curData.skuSpecList.length || selectNum<1){
      alert("请选择正确规格");
      return;
    }

    var id='';//用拼接的ID作为key，12131232；34235435
    var spec = [];//规格

    for(var i=0;i<actives.length;i++){
      id+=actives[i].getAttribute('data-id')+';';
      spec.push(actives[i].innerHTML);
    }
    id = id.substring(0,id.length-1);////substring(start,end+1);

    var select={
      "id":id,
      "name":curData.name,
      "price":curData.retailPrice,
      "num":selectNum,
      "spec":spec,
      "img":curData.skuMap[id].picUrl,
      "sign":"productLocal"//给自己的local取一个标识，避免取到其他人的local
    };

    // console.log(id,curData.skuMap,curData.skuMap['1132095;1132098'].picUrl);
    // 把声明的对象存在localstroage里面
    localStorage.setItem(id,JSON.stringify(select));//把JavaScript的形式转换为JSON
    // console.log(localStorage);
    yx.public.shopFn();

    var cartWrap = yx.g('.cartWrap');
    cartWrap.onmouseenter();//点击加入购物车后，购物车自动弹出显示框，2s后消失
    setTimeout(function(){
      yx.g('.cart').style.display = 'none';
    },2000)
  };
})();

//大家都在看
(function(){
  var ul = yx.g('#look ul');
  var str='';
  
  for(var i=0;i<recommendData.length;i++){
    str +='<li><a href="#"><img src="'+recommendData[i].listPicUrl+'" alt=""></a><a href="#">'+recommendData[i].name+'</a><span>￥'+recommendData[i].retailPrice+'</span></li>'
  }
  ul.innerHTML=str;

  //轮播图
  var allLook = new Carousel();
  allLook.init({
    id : 'allLook',                 //轮播图父级的id,必需传的参数
    autoplay : false,            //自动播放，true为自动
    intervalTime : 3000,        //间隔时间，运动后停顿的时间
    loop : false,                //循环播放，
    totalNum : 8,               //图片总量
    moveNum : 4,                //单次运动的图片数量（图片总量必须为运动数量的倍数）
    circle : false,              //小圆点功能，
    moveWay : 'position'         //运动方式，opacity为透明过渡、position为位置过渡
  });
})();

//详情和评价
(function(){
  var as = yx.ga('#bottom .title a');
  var tabs = yx.ga('#bottom .content>div');
  var ln = 0;

  for(var i=0;i<as.length;i++){
    as[i].index = i;
    as[i].onclick = function(){
      as[ln].className = '';
      tabs[ln].style.display = 'none';

      this.className = 'active';
      tabs[this.index].style.display = 'block';
      
      ln = this.index;
    };
  }

  //详情 内容的产品参数
  var tbody = yx.g('.details tbody');
  for(var i=0;i<curData.attrList.length;i++){
    // 1. 共有6条数据 ，需创建3个tr,12个td
    // 2.一个对象里包含两个数据，就需要两个td，所以每循环一次要创建两个td
    // 3。 一个tr里包含了四个td，所以循环两次创建一个tr
    if(i%2==0){
      var tr = document.createElement('tr');
    }
    var td1 = document.createElement('td');
    td1.innerHTML =curData.attrList[i].attrName;
    var td2 = document.createElement('td');
    td2.innerHTML =curData.attrList[i].attrValue;

    tr.appendChild(td1);
    tr.appendChild(td2);

    tbody.appendChild(tr);
  }
  //详情图片展示
  var img = yx.g('.details .img');
  img.innerHTML = curData.itemDetail.detailHtml;

})();
//评价
(function(){
  console.log(commentData);

  var evaluateNum = commentData[pageId].data.result.length;//评价数量
  var evaluateText = evaluateNum>1000? '999+':evaluateNum;
  yx.ga('#bottom .title a')[1].innerHTML = '评价<span>('+evaluateText+')</span>';

  var allData = [[],[]];//第一个全部评价，第二个有图评价
  for(var i=0;i<evaluateNum;i++){
    allData[0].push(commentData[pageId].data.result[i]);

    if(commentData[pageId].data.result[i].picList.length){//有图片
      allData[1].push(commentData[pageId].data.result[i]);
    }
  }
  yx.ga('#bottom .eTitle span')[0].innerHTML = '全部('+allData[0].length+')';
  yx.ga('#bottom .eTitle span')[1].innerHTML = '有图('+allData[1].length+')';

  var curData = allData[0];//当前显示数据
  var btns = yx.ga('#bottom .eTitle div');
  btns[0].className = 'active';
  var ln=0;

  for(var i=0;i<btns.length;i++){
    btns[i].index = i;
    btns[i].onclick = function(){
      btns[ln].className = '';
      this.className = 'active';
      ln = this.index;

      curData = allData[this.index]; 
      showComment(10,0);

      creatPage(10,curData.length);//切换成不同评论时，其下面的页码也需更改
    };
  }
//显示评价数据
showComment(10,0);
  function showComment(pn,cn){//pn一页显示数，cn当前页码
    var ul = yx.g('#bottom .border>ul');
    var dataStart = pn*cn;  //数据起始值
    var dataEnd = dataStart+pn;

    if(dataEnd>curData.length){//若结束值》数据的总量，循环时会报错，所以要把结束值改为数据总量
      dataEnd = curData.length
    }

    //主体结构
    var str = '';
    ul.innerHTML = '';
    for(var i=dataStart;i<dataEnd;i++){
      var avatart = curData[i].frontUserAvatar?curData[i].frontUserAvatar:'images/avatar.png';
      
      var smallImg = '';//小图的父级，要放在if外面
      var dialog = '';//轮播图的父级，要放在if外面

      if(curData[i].picList.length){
        //说明此评论有图片
        var span = '';
        var li ='';//轮播图父级是个li标签
        for(var j=0;j<curData[i].picList.length;j++){
          span +='<span><img src="'+curData[i].picList[j]+'" alt=""></span>';
          li += '<li><img src="'+curData[i].picList[j]+'" alt="" /></li>'; 
        }
        smallImg =  '<div class="smallImg clearfix">'+span+'</div>';
        dialog =   '<div class="dialog" id="commmetImg'+i+'" data-imgnum="'+curData[i].picList.length+'">'+
        '<div class="carouselImgCon">'+
          '<ul>'+li+'</ul></div><div class="close">X</div></div>';
      }

      str +=                    
      '<li>'+
      '<div class="avatar">'+
        '<img src="'+avatart+'" alt="图片"/>'+
        '<a href="#" class="vip1"></a><span>'+curData[i].frontUserName+'</span>'+
      '</div>'+
      '<div class="text">'+
        '<p>'+curData[i].content+'</p>'+smallImg+
        '<div class="color clearfix">'+
          '<span class="left">'+curData[i].skuInfo+'</span>'+
          '<span class="right">'+yx.formatDate(curData[i].createTime)+'</span>'+
        '</div>'+dialog+
      '</div>'+
    '</li>'
    }
    ul.innerHTML= str;
    showImg();
  }

  //调用轮播图组件
  function showImg(){
    var spans = yx.ga('#bottom .smallImg span');
    for(var i=0;i<spans.length;i++){
      spans[i].onclick = function(){
        var dialog = this.parentNode.parentNode.lastElementChild;
        console.log(this,dialog);
        dialog.style.opacity = 1;
        dialog.style.height = '510px';

        var en = 0;
        dialog.addEventListener('transitinend',function(){
          en++;
          if(en==1){
            var id = this.id;
            var commentImg = new Carousel();
            commentImg.init({
              id:id,
              totalNum:dialog.getAttribute('data-imgnum'),
              autoplay:false,
              loop:false,
              moveNum:1,
              circle:false,
              moveWay:'position'
            });
          }
        });
        var closeBtn = dialog.querySelector('.close');
        closeBtn.onclick = function(){
          dialog.style.opacity = 0;
          dialog.style.height = 0;
        };
      }
    }
  }
  creatPage(10,curData.length);
  //页码功能  后期可考虑写成组件模式
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
})();

