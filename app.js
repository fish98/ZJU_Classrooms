const fetch = require('node-fetch')
const cheerio = require('cheerio')
const FormData = require('form-data')

const site = "http://jxzygl.zju.edu.cn/jxzwsyqk/jxcdkb.aspx?jsdl=1"
let flag = 0

let conf = {
  ScriptManager1: 'ScriptManager1|btnSelect',
  xn: '2017-2018',
  xq: `2,春`,
  ddlXq: '5',
  js0: '-1',
  js: '511B0306',
  ddlZc: '2',
  btnSelect: '查询'
}

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
  await fetch(site, {
      method: "POST",
      body
    })
    .then(res => res.text())
    .then(body => {
      console.log(body)
    })
    .catch(err => console.log(err))
}

async function ttfish() {
  await getXuanXue()
  await changeXuanXue()
  await getXuanXue()
  await changeXuanXue()
  await getDetail()
}

ttfish()
