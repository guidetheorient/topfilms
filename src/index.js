var App = {
  init:function(){
    this.tab = $('#footer>ul>li')
    this.bind()
    Top250.init()
    NA.init()
    Search.init()
  },
  bind:function(){
    this.tab.click(function(){
      $(this).addClass('active').siblings().removeClass('active')
      $('#main section').hide().eq($(this).index()).fadeIn()
    })
  }
}
var Top250 = {
  init:function(){
    this.index = 0;
    this.isLoading = false
    this.bind()
    this.start()
  },
  bind:function(){
    $('section.top250').scroll(()=>{
      if(Common.isBottom($('.top250'),$('.top250 .wrap'))){
        this.start()
      }
    })
  },
  start:function(){
    if(this.index >= 20){
      $('.top250 .loading').text('没有更多了')
      return
    }
    $('.top250 .loading').show()
    this.getData((data)=>{
      this.render(data)
    })
  },
  getData:function(callback){
    if(this.isLoading){return}
    this.isLoading = true

    var _this = this
    $.ajax({
      url:'https://api.douban.com/v2/movie/top250',
      data:{
        start:_this.index,
        count:10
      },
      dataType:'jsonp'
    }).done((data)=>{
      // console.log(this.index)
      // console.log(data)
      this.index += 10
      callback(data)
    }).fail((error)=>{
      console.log(error)
    }).always(()=>{
      this.isLoading = false
    })
  },
  render:function(data){
    $('.top250 .film-list').append(Common.generateNode(data.subjects))
    $('.top250 .loading').hide()
  }
}
var NA = {
  init:function(){
    this.start()
  },
  start:function(){
    $('.north-america .loading').show()
    this.getData((data)=>{
      var datahandled = []
      data.subjects.map((item)=>{
        datahandled.push(item.subject)
      })
      this.render(datahandled)
    })
  },
  getData:function(callback){
    $.ajax({
      url:'https://api.douban.com//v2/movie/us_box',
      dataType:"jsonp"
    }).done((data)=>{
      callback(data)
    }).fail((error)=>{
      console.log(error)
    })
  },
  render:function(data){
    $('.north-america .film-list').append(Common.generateNode(data))
    $('.north-america .loading').hide()
  }
  
}
var Search = {
  init:function(){
    this.index = 0
    this.value = ''
    this.clock = null
    this.$searchBtn = $('section.search .search-button')
    this.$input = $('section.search input')
    this.bind()
  },
  bind:function(){
    var _this = this
    this.$input.on('keydown',function(e){
      if(e.keyCode === 13){
        $(this).trigger('search')            
      }
    })
    this.$searchBtn.click(()=>{
      $('.search .loading').show()
      this.$searchBtn.trigger('search')
    })
    this.$input.add(this.$searchBtn).on('search',function(){
      clearTimeout(_this.clock)
      _this.clock = setTimeout(function(){
        console.log(1)
        _this.value = $('section.search input').val()
        _this.getResult((data)=>{
          _this.render(data)
        })  
      },300)
      
    })
  },
  getResult:function(callback){
    $.ajax({
      url:'https://api.douban.com/v2/movie/search',
      data:{
        q: this.value,
      },
      dataType:'jsonp'
    }).done((data)=>{
      callback(data)
    }).fail((error)=>{
      console.log(error)
    })
  },
  render:function(data){
    $('.search .film-list').html('').append(Common.generateNode(data.subjects))
    $('.search .loading').hide()
  }
}

var Common = {
  isBottom:function($window,$content){
    windowHeight = $window.height()
    offsetTop = $window.scrollTop()
    contentHeight = $content.height()
    if( windowHeight+offsetTop >= contentHeight - 10){
      return true
    }else{
      return false
    }
  },
  generateNode:function(filmList){
    var $list = $('<ul></ul>')
    filmList.map((item,index)=>{
      var $li = $(`
        <li>
          <a class="link clearfix" href="">
            <div class="cover">
              <img src="//img7.doubanio.com/view/photo/s_ratio_poster/public/p480747492.jpg" alt="">
            </div>
            <div class="detail">
              <h2 class="name">肖申克的救赎</h2>
              <p><span class="score">9.6</span>分 / <span class="collect">2222222</span>收藏</p>
              <p><span class="year">1994</span> / <span class="type">犯罪 / 剧情</span></p>
              <p>导演：<span class="director">弗兰克·德拉邦特</span></p>
              <p>主演：<span class="actor">蒂姆·罗宾斯、摩根·弗里曼、鲍勃·冈顿</span></p>
            </div>
          </a>
        </li>
      `);
      $li.find('.link').attr('href',item.alt)
      $li.find('.cover img').attr('src',item.images.medium)
      $li.find('.name').text(item.title)
      $li.find('.score').text(item.rating.average)
      $li.find('.collect').text(item.collect_count)
      $li.find('.year').text(item.year)
      $li.find('.type').text(item.genres.join(' / '))
      $li.find('.director').text(()=>{
        let directors = []
        item.directors.map((item)=>{
          directors.push(item.name)
        })
        return directors.join('、')
      })
      $li.find('.actor').text(()=>{
        let actors = []
        item.casts.map(function(item){
          actors.push(item.name)
        })
        return actors.join('、')
      })
      $list.append($li)
  })
  return $list.children()
  }
}
App.init()