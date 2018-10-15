# Node Spider for Free ClassRoom in ZJU 

* Updated on 8102/10/15

看来这个学期还是需要用这个爬虫来生成课表 嘤嘤嘤

索性加上一个季节开关 到时候在config里面改就好了 (什么时候产品经理能自己使用这个捏？逃)

等一下尝试打包成electron版本试一试 hiahiahia

## TTFish爬取2018紫金港部分教室 生成夏学期课表

有许多地方可以改进 尤其是对于纯函数的实现 不是非常的喵 

能进行更改的config分别在config.js和app.js第34行的conf

非常欢迎重写 开一些高级的优化 做一些高效的事情 但禁止使用PHP重写!! 

远古代码php版本链接：https://git.zjuqsc.com/ZhangXiangyu/classroomTimetable

## 关于运行

`npm install` + `npm start`就可以啦

ps.由于linux中可能会因为79个教室太多导致内存吃满而不小心被系统杀掉
建议在有钱人的电脑(>=16GB?) 或者Windows上运行`npm start`就行啦 (真香?

---

## Brief Intro

Spider for School Classrooms Courses

Mr.Boya used the world's best coding language to form the classroom course images last year while the parallel running caused the stuck up and overflow on the Dev Qsc and the whole process lasted for 10 hours

So I have to rewite it in node.js

Trying best to adjust the web page from school classroom register center 

Really awful experience for digging data and fixing forms (Especially in parsing string )

Those Unknown but long Validations are really really *** 

Well, Whatever....

Just let me set a flag here 

It will not be me again to rewrite or redig these database next year 

So 

Not that unsatisfied now

## Usage

! The website is only access available in ZJU school (DNS parse) networks

After`git clone`, please run `npm install` to pack all the dependencies

As for all the files: 

`config.js`: Set different seasons background image and set target dir to store images

`ClassRoom.js`: Store all the classroom needed to be traversed (Provided by the PMs)

Run `npm start` to start forming classroom course images

The process will last 5 minutes or so, Much faster than PHP

**Alert: Please ensure your computer have at least 8GB memory!!!**

Well

Have Fun ~

TTfish