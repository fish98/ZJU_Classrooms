const fetch = require('node-fetch')
const cheerio = require('cheerio')
const FormData = require('form-data')
const classRoom = require('./ClassRoom').data

const requireClass = []

// 解析教室信息并合并为数组

const find = cheerio.load(classRoom)
find('option').map((index, item) => {
    requireClass.push(find(item).attr('value'))
})

const site = "http://jxzygl.zju.edu.cn/jxzwsyqk/jxcdkb.aspx?jsdl=1"
let flag = 0

let conf = {
  ScriptManager1: 'ScriptManager1|btnSelect',
  xn: '2017-2018',
  xq: `2,春`,
  ddlXq: '5',
  js0: '-1',
  js: '511B0306',
  btnSelect: '查询'
}

let course = new Array(); // 初始化array 希望以后能用fill重写
for (var k = 0; k < 15; k++) { // 有16行
  course[k] = new Array();
  for (var j = 0; j < 14; j++) { // 14列
    course[k][j] = 0;
  }
}

// 一整段都是玄学的东西

async function getXuanXue() {
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

async function changeXuanXue() {
  if (!flag) {
    delete conf.btnSelect
    delete conf.ScriptManager1
    conf['__EVENTTARGET'] = 'ddlXq'
    flag = 1
  } else {
    delete conf['__EVENTTARGET']
    conf.btnSelect = '查询'
    flag = 0
  }
}

async function getDetail() {
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

async function createForm(html) {
  const $ = cheerio.load(html)
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
                  course[row - 2 + a][col - rowOffset + colOffset + b] = 1
                }
              }
              colOffset += (width - 1)
            }
          }
        })

    }
  })
  console.log(course)
}

// 最终获得并生成课程排列数组

async function getCourse() {
  await getXuanXue()
  await changeXuanXue()
  await getXuanXue()
  await changeXuanXue()
  const html = await getDetail()
  await createForm(html)
}

// 为了异步而异步

async function ttfish() {
  await getCourse()
}

// ttfish()
