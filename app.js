const fetch = require('node-fetch')
const cheerio = require('cheerio')
const FormData = require('form-data')
const classRoom = require('./ClassRoom').data
const Jimp = require('jimp')

const requireClass = []

// 解析教室信息并合并为数组

const find = cheerio.load(classRoom)
find('option').map((index, item) => {
  requireClass.push(find(item).attr('value'))
})

/* 主函数 */

async function ttfish() {
  requireClass.map(async classroom => {
    let conf = {
      ScriptManager1: 'ScriptManager1|btnSelect',
      xn: '2017-2018',
      xq: `2,夏`,
      ddlXq: '5',
      js0: '-1',
      js: classroom,
      btnSelect: '查询'
    }

    const site = "http://jxzygl.zju.edu.cn/jxzwsyqk/jxcdkb.aspx?jsdl=1"

    let course = new Array(); // 初始化array 希望以后能用fill重写
    for (var k = 0; k < 15; k++) { // 有14行
      course[k] = new Array();
      for (var j = 0; j < 14; j++) { // 13列
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

async function changeXuanXue_1(conf) {
  delete conf.btnSelect
  delete conf.ScriptManager1
  conf['__EVENTTARGET'] = 'ddlXq'
}

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
       } 
       else if (courseDetail.substr(point + 1, 1) >= 1 && courseDetail.substr(point + 1, 1) < 10) {
         count = count + 1
       }
      point = courseDetail.indexOf("第", point + 1)
    }
  }
  if(count < 4) {
    return 0
  }
  else{
    return 1
  }
}

/* 生成课程数组 并返回课程名 */

async function createForm(html, course) {
  const $ = cheerio.load(html)
  let roomName = $('#lbCount').text()
  roomName = roomName.substr(roomName.indexOf('港') + 1, 7)
  // 坑
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
  console.log(`Success form ${classRoomName} Array`)
  return courseArrayInfo
}

// form the image

async function createImg(courseArray, classRoomName) {

  const bg = await Jimp.read('./img/summer.png')
  let classImage = await Jimp.read('./img/class.png')
  const Dong = await Jimp.read('./font/dong.png')
  const Xi = await Jimp.read('./font/xi.png')
  //let classImage = classImg.resize(150, 120)
   

  for (var i = 0; i < 13; i++) {
    for (var j = 0; j < 7; j++) {
      if (courseArray[i][j]) {
        bg.composite(classImage, 177 * j + 1240, 550 + 140 * i + 130 * Math.floor((i) / 5))
      }
    }
  }
  // print Dong or Xi

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
    bg.write(`./FinalClassRoom/${classRoomName}.png`)
    console.log(`Finish write ${classRoomName}`)
  }

  await writeImg()
}

ttfish()