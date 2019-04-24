var app = getApp()
var WxParse = require('../../components/wxParse/wxParse.js');
var wxDiscode = require('../../components/wxParse/wxDiscode.js');
var api = require('../../utils/bao.js');
var utils = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: true,
    scrollLeft: 0,
    professionalfocusstate: false,
    detail: {},
    tuilist: [],
    starttime: 0,
    scrollHeight: 300,
    day: "",
    screenBtnShow: false,
    isShare: true,
    options: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ show: !app.globalData.iswifi });
    app.start();
    app.networkchange(() => {
      this.setData({show: !app.globalData.iswifi})
    })
    this.setData({options});
    this.list(options.id);
    if (app.manage) {
      app.manage.pause();
      app.globalData.yinshow = true;
    }

  },
  islogin() {
    let {options = {}} = this.data;
    // 来自分享，的判断
    if (app.globalData.accessToken === '') {
      this.setData({ isShare: true })
    }else{
      this.setData({isShare: false})
    }
    this.detail(options.id);

  },
  isFromShare(){
    console.log('进入分享的方法', this.data.options.id);
    this.detail(this.data.options.id);
  },
  onHide: function () {
    var that = this;
    var starttime = that.data.starttime;
    var time = Date.now() - starttime;
    app.maidian("视频详情停留时长", "视频停留时长", time + '')
    this.bgmgoon()
  }, 
  onShareAppMessage: function (res) {
    return {
      title: this.data.detail.title,
      path: utils.getCurrentPageUrlWithArgs() + '&share=vadio'
    };
  },
  onShow: function () {
    var that = this;
    var starttime = Date.now();
    var date = new Date();
    var day = date.getDate();
    wx.getSystemInfo({
      success: function (res) {
        var height = res.windowHeight;
        that.setData({
          scrollHeight: height,
          starttime: starttime,
          day: day
        });
      }
    })
    app.maidian("视频详情", "进入视频详情的pv", "视屏详情页面")
    app.chuzun("shipindetail", day, "视屏详情", "进入视屏详情的uv", "视屏详情页面")
  },
  detail: function (id) {
    let url = this.data.isShare ? '/video/passthrough/' : '/video/';
    api.getInfo(url + id, d => {
      if (d.code == 200) {
        if (d.result.content) {
          d.result.content = wxDiscode.strDiscode(d.result.content);
        }
        this.setData({ detail: d.result, professionalfocusstate: d.result.likestate, show: !app.globalData.iswifi })
        WxParse.wxParse('wxParseDescription', 'html', d.result.content, this, 10);
      }
    })
  },

  codede() {

  },
  list: function (id) {
    var that = this;
    var data = { offset: 0, limit: 99, mainvideoid: id }
    api.videorandom(true, data, function (d) {
      if (d.code == 200) {
        that.setData({ tuilist: d.result })
      }
    })
  },
  onReady() {
    this.videoCtx = wx.createVideoContext('myVideo');

    var that = this;
    // app.aldstat.sendEvent('点击视频', {
    //   '视频的pv': that.detail.title
    // });
    app.aldstat.sendEvent('点击视频', {
      '播放视屏按钮pv': that.detail.title
    });
    var day = that.data.day;
    app.chuzun("shipinbo", day, "点击视频", "播放视屏按钮的uv", that.detail.title)
  },

  bindwaiting: function () {
    console.log("bindwaiting");
    console.log(this.videoCtx);
  },
  bindended() {
    console.log("hhhh");
    this.videoCtx.exitFullScreen();
    this.setData({ show: true })
  },
  binderror(e) {
    if (this.videoCtx) {
      this.videoCtx.pause();
    }
    console.log(e)
    console.log("hhhhhhhhhhhh")
    this.setData({ show: true })
  },

  play(e) {
    if(this.videoCtx){
      this.setData({ show: false })
      this.videoCtx.play();
      var that = this;
      console.log("hhhh")
      app.aldstat.sendEvent('点击视频', {
        '播放按钮pv': that.detail.title
      });
      setTimeout(() => this.setData({ screenBtnShow: true }), 3e3)
      setTimeout(() => this.setData({ screenBtnShow: false }), 1e4)
    }
  },
  pause() {
    this.videoCtx.pause();
  },
  bindplay: function () {//开始播放按钮或者继续播放函数
    console.log("开始播放")

    setTimeout(() => this.setData({ screenBtnShow: true }), 3e3)
    setTimeout(() => this.setData({ screenBtnShow: false }), 1e4)
  },
  bindpause: function () {//暂停播放按钮函数
    console.log("停止播放")
    app.aldstat.sendEvent('点击视频', {
      '点击视屏暂停的pv': this.detail.title
    });
    var day = this.data.day;
    app.chuzun("shipinzan", day, "点击视频", "点击视屏暂停的uv", this.detail.title)
  },
  bindfullscreenchange: function (e) {
    console.log(e);
    var that = this;
    var fullScreen = e.detail.fullScreen;
    if (fullScreen) {
      app.aldstat.sendEvent('点击视频', {
        '点击视屏全屏幕pv': that.detail.title
      });
      var day = that.data.day;
      app.chuzun("shipinquan", day, "点击视频", "点击视屏全屏幕的uv", that.detail.title)
    }

  },
  guan: function (e) {
    console.log(e);
    var id = e.currentTarget.dataset.id;
    var that = this;
    var data = { id: id };
    if (!that.data.professionalfocusstate) {
      api.videozan(true, data, function (d) {
        if (d.code == 200) {
          wx.showToast({
            title: '点赞！',
            icon: 'success',
            success: function () {
              that.data.detail.likenum = parseFloat(that.data.detail.likenum) + 1;
              that.setData({ professionalfocusstate: true, detail: that.data.detail })
              app.aldstat.sendEvent('点击视频', {
                '视频点赞pv': '点赞'
              });
            }
          })

        }
      })


    } else {

      api.videounzan(true, data, function (d) {
        if (d.code == 200) {
          wx.showToast({
            title: '取消点赞！',
            icon: 'success',
            success: function () {
              that.data.detail.likenum = parseFloat(that.data.detail.likenum) - 1;
              that.setData({ professionalfocusstate: false, detail: that.data.detail })
            }
          })

        }


      })

    }

  },
  nav: function (e) {
    var that = this;
    var title = e.currentTarget.dataset.id.title;
    app.aldstat.sendEvent('视频相关推荐', {
      '视频相关推荐的pv': title
    });
  },
  // 收藏和取消收藏
  favorite(){
    let {detail} = this.data;
    let {id} = detail;
    let fn = res => {

      if (res.code == 200) {
        wx.showToast({
          title: '收藏成功！',
          icon: 'success',
          success: () => this.setData({ detail: Object.assign(detail, { favoritestate: true }) })
        })

      }

    }
    api.getInfo(`/video/${id}/favorite`, fn, 'post')
  },
  unfavorite() {
    let { detail } = this.data;
    let { id } = detail;
    let fn = res => {

      if (res.code == 200) {
        wx.showToast({
          title: '取消收藏！',
          icon: 'success',
          success: () => this.setData({ detail: Object.assign(detail, { favoritestate: false }) })
          
        })

      }

    }

    api.getInfo(`/video/${id}/favorite`, fn, 'delete')
  },
  screen(){
    console.log('全屏按钮')
    this.videoCtx.requestFullScreen();
    this.setData({ screenBtnShow: false })
  },
  bgmgoon(){
    console.log('离开页面');
    if(app.globalData.manage.url){
      let { img, playUrl, title, url } = app.globalData.manage;
      app._createAudio(playUrl, title, img, url);
    }
  },
  onUnload() {
    this.bgmgoon()
  }
})