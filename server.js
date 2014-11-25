// require('longjohn');

var fs = require('fs');
var path = require('path');
var koa = require('koa');
var route = require('koa-route');
var views = require('co-views');
var serve = require('koa-static');
var app = koa();

var render = views(__dirname, { ext: 'ejs' });
app.use(serve('.'));

app.use(route.get('/', function *(){
  this.body = yield render('index');
}));

/**
 * 获取播放列表
 */
app.use(route.get('/api/list', list));

function *list() {
  playList = {}
  walkInto('./music/',['.mp3'],function(err,data){
      playList = data
  })
  this.response.status= 200
  this.response.body= playList;
}

app.listen(3000);

/**
 * 遍历目录
 * @param  {[type]} dir      [目录地址]
 * @param  {[type]} excludes [包括的文件后缀]
 * @param  {[type]} back     [回调函数]
 * @return {[type]}          [description]
 */
function walkInto(dir, excludes, back) {
    var result = [];
    var files = fs.readdirSync(dir);
    files = files.filter(function(value){
      var extName = path.extname(value)
      if (value[0] == '.') {
        return false;
      }
      /**
       * 没有扩展名的认为是目录,保留
       */
      if (!extName) {
        return true;
      }
      return (excludes.indexOf(extName) == 0);
    });
    var pending = files.length;
    if (!pending) return back(null, result);
    files.forEach(function(file){
      var stats = fs.statSync(dir + '/' + file);
      if (stats.isFile()) {
          result.push({path:'/' + dir + '/' + file,name:file})
          if (!--pending) back(null, result);
      }
      if (stats.isDirectory()) {
          walkInto(dir + '/' + file, excludes, function(err, res){
              result = result.concat(res);
              if (!--pending) back(null, result);
          })
      }
    })
}
