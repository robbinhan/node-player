var fs = require("fs");
var path = require("path");
var Koa = require("koa");
var Router = require("koa-router");
var serve = require("koa-static");
const render = require("koa-ejs");

var app = new Koa();
var router = new Router();

render(app, {
  root: path.join(__dirname, "views"),
  layout: false,
  viewExt: "ejs",
  cache: false,
  debug: false
});

app.use(serve("."));

router.get("/", async (ctx, next) => {
  await ctx.render("index");
});

/**
 * 获取播放列表
 */
router.get("/api/list", async (ctx, next) => {
  playList = {};
  walkInto("./music/", [".mp3"], (err, data) => {
    playList = data;
  });
  ctx.body = playList;
});

app.use(router.routes());

app.listen(3000, () => {
  console.log("start server on 3000");
});

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
  files = files.filter(function(value) {
    var extName = path.extname(value);
    if (value[0] == ".") {
      return false;
    }
    /**
     * 没有扩展名的认为是目录,保留
     */
    if (!extName) {
      return true;
    }
    return excludes.indexOf(extName) == 0;
  });
  var pending = files.length;
  if (!pending) return back(null, result);
  files.forEach(function(file) {
    var stats = fs.statSync(dir + "/" + file);
    if (stats.isFile()) {
      result.push({ path: "/" + dir + "/" + file, name: file });
      if (!--pending) back(null, result);
    }
    if (stats.isDirectory()) {
      walkInto(dir + "/" + file, excludes, function(err, res) {
        result = result.concat(res);
        if (!--pending) back(null, result);
      });
    }
  });
}
