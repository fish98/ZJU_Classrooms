'use strict'

// @ 8102/10/15 今年想改代码 忽然发现去年就已经兼容多季节生成了 真开心hhh

// @ TTFish爬取2018紫金港部分教室 生成四季课表?HiaHiaHia
// @ 有许多地方可以改进 尤其是对于纯函数的实现 非常的不好 
// @ 能进行更改的config分别在config.js和第34行的conf
// @ 非常欢迎重写 但禁止使用PHP!! 
// @ 远古代码php版本链接：https://git.zjuqsc.com/ZhangXiangyu/classroomTimetable

const fetch = require('node-fetch')
const cheerio = require('cheerio')
const FormData = require('form-data')
const classRoom = require('./ClassRoom')
const Jimp = require('jimp')

const ClassRoomDir = require('./config').target
const bgSeason = require('./config').season
const year = require('./config').year

// 季节不同导致下面的conf参数xq不一样 检测函数

let xqConfig 

switch(bgSeason){
    case 'spring': xqConfig = '2,春'; break;
    case 'summer': xqConfig = '2,夏'; break;
    case 'autumn': xqConfig = '1,秋'; break;
    case 'winter': xqConfig = '1,冬'; break;
    default: throw new Error('Do Not Dear Modefy My Code and Configure Config File Correctly!!!'); break;
  }

// 设置课表图片导出文件夹

const requireClass = []

// 解析教室信息并合并为数组

const find = cheerio.load(classRoom)
find('option').map((index, item) => {
  requireClass.push(find(item).attr('value'))
})

/* 主函数 */

async function ttfish() {
  requireClass.map(async classroom => {

    /* Config 初始化设置 */

    let conf = {
      ScriptManager1: 'ScriptManager1|btnSelect',   /* 不可更改 */
      xn: year,                                     /* 当前学年 */
      xq: xqConfig,                                   /* 当前学期 */
      ddlXq: '5',                                   /* '5' 代表紫金港 */
      js0: '-1',                                    /* 不可更改 鬼知道这是什么 */
      js: classroom,                                /* 读入的教室数组 */
      btnSelect: '查询'                              /* 不可更改 */
    }

    const site = "http://jxzygl.zju.edu.cn/jxzwsyqk/jxcdkb.aspx?jsdl=1" //教务网 非学校内网DNS不能访问

    let course = new Array(); // 初始化array 希望以后能用fill重写 懒得改了
    for (var k = 0; k < 15; k++) { // 有14行 单双周显示七天
      course[k] = new Array();
      for (var j = 0; j < 14; j++) { // 13列 每天13节课
        course[k][j] = 0;
      }
    }

    let courseArrayInfo = await createArray(conf, site, course)
    const courseArray = courseArrayInfo.courseArray
    const classRoomName = courseArrayInfo.classRoomName

    await createImg(courseArray, classRoomName)
  })
}

// 一整段都是玄学的东西

/* 请求 需要附带对应教室正确的FormData */

async function getXuanXue(conf, site) {
  let form = new FormData()
  Object
    .keys(conf)
    .forEach(item => form.append(item, conf[item]))
  await fetch(site, {
      method: 'POST',
      body: form
    })
    .then(res => res.text())
    .then(body => {
      let $ = cheerio.load(body)
      $('input[type=hidden]').map((i, item) => {
        if (typeof($(item).attr("name")) !== Object && ($(item).attr("value"))) {
          let tmpName = $(item).attr("name")
          let tmpValue = $(item).attr("value")
          conf[tmpName] = tmpValue
        }
      })
    })
}

/* change config data */

/* 第一次请求 需要get到对应教室正确的FormData */

async function changeXuanXue_1(conf) {
  delete conf.btnSelect
  delete conf.ScriptManager1
  conf['__EVENTTARGET'] = 'ddlXq'
}

/* 第二次请求 需要附带到对应教室正确的FormData 并进行真正的请求 */

async function changeXuanXue_2(conf) {
  delete conf['__EVENTTARGET']
  conf.btnSelect = '查询'
}

/* 最终的有用请求函数 */

async function getDetail(conf, site) {
  delete conf.ScriptManager1
  let body = new FormData()
  Object
    .keys(conf)
    .forEach(i => body.append(i, conf[i]))
  const res = await fetch(site, {
    method: "POST",
    body
  })
  const html = await res.text()
  return html
}

/* 检测是否需要打印有课标志函数 */

/* TTFish添加字符串解析:

1、遇到博士或者研究生 标为有课 无论周学时长
2、遇到"第X-X"的 解析前后数字 相减后加入count
3、遇到"第X"的 直接count + 1 一般为考试
ps.其实还有其他情况 TTFish懒得写 因为在需要请求的教室中不存在情况 (例: "X周"类型的研究生课表)
4、判断count是否大于4周时 决定是否标为有课

*/

function enoughCourse(courseDetail) {
  let point = 0
  let count = 0
  if (courseDetail.indexOf("研究生") !== -1 || courseDetail.indexOf("博士") !== -1) {
    return 1
  } else {
    point = courseDetail.indexOf("第")
    while (point !== -1) {
      if ((courseDetail.substring(point + 2, point + 3)) === '-') {
        count += (courseDetail.substr(point + 3, 1) - courseDetail.substr(point + 1, 1) + 1)
      } else if (courseDetail.substr(point + 1, 1) >= 1 && courseDetail.substr(point + 1, 1) < 10) {
        count = count + 1
      }
      point = courseDetail.indexOf("第", point + 1)
    }
  }
  if (count < 4) {
    return 0
  } else {
    return 1
  }
}

/* 生成课程数组 并返回课程名 */

async function createForm(html, course) {
  const $ = cheerio.load(html)
  let roomName = $('#lbCount').text()
  roomName = roomName.substr(roomName.indexOf('港') + 1, 7)

  /* 字符串解析的坑 */

  if (roomName.slice(-1) === '(') {
    roomName = roomName.substring(0, roomName.length - 1)
  }
  $('#Table6 > tbody > tr').map((row, item) => {
    if (row > 1) {
      let colOffset = 0 // 全局偏移量
      const rowOffset = (row === 2 || row === 7 || row === 12) + 1
      $(item)
        .find('td')
        .map((col, item) => {

          /* 讲课程写入数组 当前存储为0、1格式 如果有兴趣可以log出来看一下 或者将课程名称取出来 */

          if (col > 0) {
            if ($(item).text() != " " && $(item).text() !== "第一节" && $(item).text() !== "第六节" && $(item).text() !== "第11节") {
              let width = $(item).attr('colspan') || 1
              let height = $(item).attr('rowspan') || 1
              for (let a = 0; a < height; a++) {
                for (let b = 0; b < width; b++) {

                  /* 添加是否满足条件添加入上课目录 */

                  let textClass = $(item).text()
                  if (enoughCourse(textClass)) {
                    course[row - 2 + a][col - rowOffset + colOffset + b] = 1
                  }
                }
              }
              colOffset += (width - 1)
            }
          }
        })
    }
  })
  return roomName
}

// 最终获得并生成课程排列数组

async function createArray(conf, site, course) {

  await getXuanXue(conf, site)

  await changeXuanXue_1(conf)

  await getXuanXue(conf, site)

  await changeXuanXue_2(conf)

  const html = await getDetail(conf, site) // get the real data needed

  const classRoomName = await createForm(html, course)

  /* 单周或者双周任意有课则打印 */

  let courseArray = course.map(items => {
    let flag = 0
    return [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ].map(i => {
      return items.slice(2 * i, 2 * i + 2)
    }).map(item => item[0] || item[1])
  })

  let courseArrayInfo = {
    courseArray: courseArray,
    classRoomName: classRoomName
  }
  console.log(`Success Generate ${classRoomName} Array`)
  return courseArrayInfo
}

// Generate the image

async function createImg(courseArray, classRoomName) {

  const bg = await Jimp.read(`./img/${bgSeason}.png`)
  let classImage = await Jimp.read('./img/class.png')
  const Dong = await Jimp.read('./font/dong.png')
  const Xi = await Jimp.read('./font/xi.png')
  //let classImage = classImg.resize(150, 120) // 设置Class图片大小

  for (var i = 0; i < 13; i++) {
    for (var j = 0; j < 7; j++) {
      if (courseArray[i][j]) {

        // 博亚学长の祖传参数+跳跳鱼的微调

        bg.composite(classImage, 177 * j + 1240, 550 + 140 * i + 130 * Math.floor((i) / 5))
      }
    }
  }
  // print Dong or Xi

  /* 由于Jimp只支持点阵字体 并且对于默认字体大小最大为128 希望一年以后能有改进 用其他库重写或裸写 */

  if (classRoomName.slice(0, 1) === '西') {
    Xi.resize(150, 150)
    bg.composite(Xi, 150, 150)
  } else {
    Dong.resize(150, 150)
    bg.composite(Dong, 150, 150)
  }

  // print classRoom Name

  await Jimp
    .loadFont(Jimp.FONT_SANS_128_WHITE)
    .then(function (font) {
      bg.print(font, 300, 165, classRoomName)
    })

  // in all to write in and pipe out

  function writeImg() {
    bg.write(`${ClassRoomDir}/${classRoomName}.png`)
    console.log(`Finish write ${classRoomName}`)
  }

  await writeImg()
}

// 调用主函数

ttfish()