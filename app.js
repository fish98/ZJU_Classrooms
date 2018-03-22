const fetch = require('node-fetch')
const cheerio = require('cheerio')
const FormData = require('form-data')
const site = "http://jxzygl.zju.edu.cn/jxzwsyqk/jxcdkb.aspx?jsdl=1"

function getClassRoom(){
    fetch(site, {
        method: "POST",
        headers: {}
  }).then(
      res => res.text()
  ).then(
      text => console.log(text)
  )
}

getClassRoom()