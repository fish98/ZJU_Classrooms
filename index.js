const fetch = require('node-fetch')
const fs = require('fs')
// const
const cheerio = require('cheerio')
const FormData = require('form-data')
const site = "http://jxzygl.zju.edu.cn/jxzwsyqk/jxcdkb.aspx?jsdl=1"

const form = new FormData()

fs.readFileSync('webRequest1', {encoding: 'utf8'})
  .split('\n')
  .forEach(item => {
    const [a,
      b] = item.split(':')
    if (!b) 
      form.append(a, b)
  })
//  console.log(form)

fetch(site, {
  method: "POST",
  headers: {
    // 'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,im
    // age/apng,*/*;q=0.8', 'Accept-Encoding':'gzip, deflate',
    // 'Accept-Language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    // 'Cache-Control':'max-age=0', 'Connection':'keep-alive',
    // 'Content-Length':'8501', 'Content-Type':'application/x-www-form-urlencoded',
    // 'Cookie':'_ga=GA1.3.696873515.1514272315;
    // ASP.NET_SessionId=dpscfs34djby3b55qrshybjy;
    // _pv0=ubWaHGPFsk4LxGGb3wztyuKfU0cCdsRJsMRT1NXNZ3mB1xPSGDHeuV%2BRaGXELy%2Bo%2FBj
    // RkS3%2Bi1WEW%2Fw9d9eKKC8H6ayqX7RGmBqTKkcAal0ohwqpWSDcooz61ELdpfNELVvn0qN0fxZJp
    // E8%2FlktJDu10fgXz%2F4IcnpJc7Hyt8PxhJ7icd0w%2BBMxhHS58vglnwSKCO%2FhwLAlR6nGvFt7
    // CtLqckwBusn8i88Qc%2BjzMdmBQd3M1FVMfgGyljQByOtHFmsK0GJ6dYMS%2BjavlrXtLceeyWlRa1
    // g7%2B8gbnYI4mgB9qjtO6hWD7alblOESNQW0yVC50UkVMM%2FlouTAre5upwNE01VGjBlb0DQCTvfI
    // lf3CB6wjsxj1%2B3zn6TYLnhdU3AUTcwCNlf%2BcBdPV%2FMzIqq6YaiC43hvGGFRq7REfw%2FZ8%3
    // D; _pf0=8bXDyHvqNVH7XJiuBV%2FgMA%3D%3D;
    // _pc0=c58CXH2o%2F8eRgcN2JRr5OGRx7VqEK7LRtifww%2BP2SO0%3D;
    // iPlanetDirectoryPro=FN4LWbmfjneezbF4%2BDyfrH1JB2qq4l6pSUIYIcNdR7bB1Jqnqt0ffs%2
    // FI5zInVN0VP0wpWS1TcJHJ%2FH8KnupPpCw4FgX%2B8cZf6lexMJVweMcbqySdDQVlmiFHQP3Ypi11
    // rtb%2FcE5Q4r5t4jGGMf4QT7Hb6wRtXUwFgvVJplyKk%2FRodZ6P8JHK00UWS0mI3tG9lzZPsEC5Da
    // ODiZ5KUYRYwoFXAGT8Sj1DjL5Qp0yNXGq1SDfoj29XC3iTzcUvoFUNdjfcjpQgkqpZ4P%2FUSSa%2F
    // HfqoEsm0pWm98uVLi5SMHsalzwkwcAhwv4ONT1hERSHAMPgxnzdIIl27i7YBxlI%2B2IZNWZj9kVvg
    // dZfxS%2FMIxgA%3D', // 'Host':'jxzygl.zju.edu.cn', //
    // 'Origin':'http://jxzygl.zju.edu.cn',
    // 'Referer':'http://jxzygl.zju.edu.cn/jxzwsyqk/jxcdkb.aspx?jsdl=1',
    // 'Upgrade-Insecure-Requests':'1', 'User-Agent':'Mozilla/5.0 (Windows NT 10.0;
    // Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186
    // Safari/537.36',
  },
    body: form
  })
  .then(res => res.text())
  .then(body => {
    console.log(body)
  })
