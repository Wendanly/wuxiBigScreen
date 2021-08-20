 //全局变量
 let fontSizeObj = {
   fontSize: 8,
   color: '#ffffff',
 }
 let tooltipObj = {
   tooltip: {
     trigger: 'item',
     confine: true,
     transitionDuration: 0,
   },
 }
 let labelObj = {
   label: {
     show: true,
     position: "top",
     ...fontSizeObj,
   }
 }
 let gridObj = {
   top: '20%',
   left: '3%',
   right: '4%',
   bottom: '3%',
   containLabel: true
 }



 function getBP() {
   const apiSecret = "97C209CA505F2958DB30A42135AFAB5C";
   const userId = "iot";
   const apiKey = "97C209CA505F2958DB30A42135AFAB5C";
   const timestamp = Date.now();
   const regId = '109963';
   const secretStr = sha1(userId + "&" + apiKey + "&" + timestamp + "&" + apiSecret);
   //  console.log(secretStr);
   let obj = {
     apiKey: apiKey,
     regId: regId,
     secretStr: secretStr,
     timestamp: timestamp,
     userId: userId,
   };
   let jsonStr = JSON.stringify(obj);
   let str = jsonStr + "iot";
   let token = MD5(str);
   return {
     token,
     params: obj
   };
 }

 function getTitle(name, num) {
   return {
     title: {
       subtext: name + '{blue|' + num + '}人',
       subtextStyle: {
         ...fontSizeObj,
         rich: {
           blue: {
             fontSize: 8,
             color: '#6dc9f3',
             fontWeight: '700'
           }
         }
       },
       padding: [-2, 3, 0, 0],
       right: '2px'
     }
   }
 }
 //全局组件
 Vue.component('my-box', {
   template: '#box-template',
   props: {
     title: '',
     char: '',
   },
   data() {
     return {
       preIcon: './img/juxing23.png',
       sufixIcon: './img/组 2608.png',
       titleBorder: './img/圆角矩形1.png',
       bTitleBorder: './img/-e-圆角矩形1.png',
       vertialList: [],
       sexList: [],
     }
   },
   mounted() {
     this.vertialList = [];
     let num = 4;
     for (let index = 0; index < 20; index++) {
       this.vertialList.push(num + 'px');
       num += 6;
     }
   },
 });
 new Vue({
   el: '#app',
   data() {
     return {
       logo: './img/logo.png',
       pageTitle: '无锡2021物联网博览会大数据平台',
       boxList: [{
         name: '实时在馆人数',
         numList: [0, 0, 0, 0]
       }, {
         name: '当天在馆人数',
         numList: [0, 0, 0, 0]
       }, {
         name: '展会累计人数',
         numList: [0, 0, 0, 0]
       }],
       // 日期相关
       year: '',
       month: '',
       day: '',
       time: '',
       dddd: '',
       // 天气相关
       weatherData: {
         tem: '',
         wea: '',
         img: ''
       },
       //char5 数据
       sexList: [{
         name: '男',
         num: 0,
         width: 0,
         left: 0,
         sexPic: './img/-e-男性.png',
       }, {
         name: '女',
         num: 0,
         width: 0,
         left: 0,
         sexPic: './img/-e-女性.png',
       }],
     };
   },
   created() {
     this.getWea(); //获取天气
     //10分钟刷一次天气
     let wea = setInterval(() => {
       this.getWea(); //先调本地服务，获取天气
     }, 10 * 60 * 1000);
     // 刷新时间 1秒一次
     let timeInterval = setInterval(this.updateTime, 1000);
     this.updateTime();

   },
   mounted() {
     // 初始化图表
     this.init();
     let initChar = setInterval(() => {
       this.init(); //
     }, 10 * 60 * 1000);

   },
   computed: {
     getweek() {
       var week = ['一', '二', '三', '四', '五', '六', '日'];
       return week[this.dddd - 1]
     }
   },
   methods: {
     getWea() {
       //  
       let paramsInfo = getBP();
       return axios.post(baseUrl + `getBaseInfo?token=${paramsInfo.token}`, {
         ...paramsInfo.params
       }).then(res => {
         if (res.data.state == 0) {
           let obj = res.data.obj;
           obj.LOGO ? this.logo = obj.LOGO : '';
           this.title = obj.TITLE ? obj.TITLE : '';
           if (obj.TEMPERATURE != '') {
             this.weatherData.tem = obj.TEMPERATURE;
           } else {
             this.weatherData.tem = this.getWeather('getTem');
           }
           if (obj.WEATHER != '') {
             this.weatherData.wea = this.getImg(obj.WEATHER).name;
             this.weatherData.img = this.getImg(obj.WEATHER).img;
           } else {
             let o = this.getWeather('getWea');
             this.weatherData.wea = o.name;
             this.weatherData.img = o.img;
           }
         } else {
           return this.$message.warning(res.data.msg)
         }
       });
     },
     charInit(key, arguement) {
       let {
         num,
         target,
         dim
       } = arguement;
       switch (key) {
         case '1':
           this.char1('无锡共计', "char1", num, target, dim);
           break;
         case '2':
           this.char2('江苏共计', "char2", num, dim, target); //维度与指标反过来
           break;
         case '3':
           this.char3('国内共计', "char3", num, target, dim);
           break;
         case '4':
           this.char4("char4", target, dim);
           break;
         case '6':
           this.char6("char6", target, dim);
           break;
         case '7':
           this.char7("char7", target, dim);
           break;
       }
     },
     init() {
       // 获取人数
       Promise.all([this.getRealCust(), this.getTotalCust()]).then(([res1, res2]) => {
         let resp = [];
         if (res1.data.state == 0) {
           resp.push({
             name: '实时在馆人数',
             num: res1.data.obj.REAL_CUST,
           }, {
             name: '当天在馆人数',
             num: res1.data.obj.TOTAL_CUST,
           });
         } else {
           return this.$message.warning(res1.data.msg)
         }

         if (res2.data.state == 0) {
           resp.push({
             name: '展会累计人数',
             num: res2.data.obj.TOTAL_CUST,
           });
         } else {
           return this.$message.warning(res2.data.msg)
         }
         resp.map((o, j) => {
           this.boxList[j].numList = String(o.num).padStart(4, '0').split('');
         });
       });
       //图1~图7
       this.request1();
       this.request2();
       this.request3();
       this.request4();
       this.request5();
       this.request6();
       this.request7();
     },
     //  实时客流、实时累计客流
     getRealCust() {
       let paramsInfo = getBP();
       return axios.post(baseUrl + `getRealCust?token=${paramsInfo.token}`, {
         ...paramsInfo.params
       });
     },
     //  展会累计人数
     getTotalCust() {
       let paramsInfo = getBP();
       return axios.post(baseUrl + `getTotalCust?token=${paramsInfo.token}`, {
         ...paramsInfo.params
       });
     },
     //  省内
     request1() {
       let paramsInfo = getBP();
       axios.post(baseUrl + `getProvinceCustSrc?token=${paramsInfo.token}`, {
         ...paramsInfo.params
       }).then(res => {
         if (res.data.state !== 0) return this.$message.warning(res.data.msg);
         let obj = res.data.obj;
         let dim = [],
           target = [];
         obj.rankData.map(o => {
           dim.push(o.rowName);
           target.push(o.rowValue);
         });
         let result = {
           num: obj.localCust,
           dim,
           target,
         };

         this.charInit('1', result);
       });
     },
     //  国内
     request2() {
       let paramsInfo = getBP();
       axios.post(baseUrl + `getCountryCustSrc?token=${paramsInfo.token}`, {
         ...paramsInfo.params
       }).then(res => {
         if (res.data.state !== 0) return this.$message.warning(res.data.msg);
         let obj = res.data.obj;
         let dim = [],
           target = [];
         obj.rankData.map(o => {
           dim.push(o.rowValue);
           target.push(o.rowName);
         });
         let result = {
           num: obj.localCust,
           dim,
           target,
         };

         this.charInit('2', result);
       });
     },
     //  国际
     request3() {
       let paramsInfo = getBP();
       axios.post(baseUrl + `getInternationalSrc?token=${paramsInfo.token}`, {
         ...paramsInfo.params
       }).then(res => {
         if (res.data.state !== 0) return this.$message.warning(res.data.msg);
         let obj = res.data.obj;
         let dim = [],
           target = [];
         obj.rankData.map(o => {
           dim.push(o.rowName);
           target.push(o.rowValue);
         });
         let result = {
           num: obj.localCust,
           dim,
           target,
         };

         this.charInit('3', result);
       });
     },
     //  APP排名
     request4() {
       let paramsInfo = getBP();
       axios.post(baseUrl + `getAppRank?token=${paramsInfo.token}`, {
         ...paramsInfo.params
       }).then(res => {
         if (res.data.state !== 0) return this.$message.warning(res.data.msg);
         let obj = res.data.obj;
         let dim = [],
           target = [];
         obj.appRank.map(o => {
           dim.push(o.rowName);
           target.push(o.rowValue);
         });
         let result = {
           dim,
           target,
         };

         this.charInit('4', result);
       });
     },
     //  性别比例
     request5() {
       let paramsInfo = getBP();
       axios.post(baseUrl + `getSexRatio?token=${paramsInfo.token}`, {
         ...paramsInfo.params
       }).then(res => {
         if (res.data.state !== 0) return this.$message.warning(res.data.msg);
         let obj = res.data.obj;
         let result = {
           dim: ['男', '女'],
           target: [obj.male, obj.female],
         };

         this.char5(result); //没用echarts画图
       });
     },
     //  年龄分布
     request6() {
       let paramsInfo = getBP();
       axios.post(baseUrl + `ageStratification?token=${paramsInfo.token}`, {
         ...paramsInfo.params
       }).then(res => {
         if (res.data.state !== 0) return this.$message.warning(res.data.msg);
         let obj = res.data.obj;
         let dim = [],
           target = [];
         obj.ageStratification.map(o => {
           dim.push(o.rowName);
           target.push(o.rowValue);
         });
         let result = {
           dim,
           target,
         };

         this.charInit('6', result);
       });
     },
     //  客流趋势
     request7() {
       let paramsInfo = getBP();
       axios.post(baseUrl + `getCustTrend?token=${paramsInfo.token}`, {
         ...paramsInfo.params
       }).then(res => {
         if (res.data.state !== 0) return this.$message.warning(res.data.msg);
         let obj = res.data.obj;
         let dim = [],
           target = [];
         obj.custTrend.map(o => {
           dim.push(o.rowName);
           target.push(o.rowValue);
         });
         let result = {
           dim,
           target,
         };

         this.charInit('7', result);
         updateChar(); //全局方法
       });
     },
     getImg(e) {
       //xue、lei、shachen、wu、bingbao、yun、yu、yin、qing
       // console.log(e);
       let img = './img/云.png';
       let name = '云';
       switch (e) {
         case 'xue':
           img = './img/雪.png';
           name = '雪';
           break;
         case 'lei':
           img = './img/雷.png';
           name = '雷';
           break;
         case 'shachen':
           img = './img/沙尘.png';
           name = '沙尘';
           break;
         case 'wu':
           img = './img/雾.png';
           name = '雾';
           break;
         case 'bingbao':
           img = './img/冰雹.png';
           name = '冰雹';
           break;
         case 'yun':
           img = './img/云.png';
           name = '云';
           break;
         case 'yu':
           img = './img/雨.png';
           name = '雨';
           break;
         case 'yin':
           img = './img/阴.png';
           name = '阴';
           break;
         case 'qing':
           img = './img/晴.png';
           name = '晴';
           break;
         default:
           img = './img/云.png';
           name = '云';
           break;
       }
       return {
         img,
         name
       };
     },
     updateTime() {
       this.year = moment().format("YYYY");
       this.month = moment().format("MM");
       this.day = moment().format("DD");
       this.time = moment().format("HH:mm:ss");
       this.dddd = moment().format('E'); //星期
     },
     // 获取天气情况
     getWeather(name) {
       let xmlhttp = new XMLHttpRequest();
       xmlhttp.onreadystatechange = () => {
         if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
           let weatherData = JSON.parse(xmlhttp.response);
           if (name == 'getTem') { //获取温度
             return weatherData.tem;
           } else if (name == 'getWea') { //获取天气
             return {
               ...this.getImg(weatherData.wea_img)
             };

           }
         }
       };
       xmlhttp.open(
         "GET",
         "https://www.tianqiapi.com/free/day?version=v6&appid=47172517&appsecret=wT1fL5xD",
         true
       );
       xmlhttp.send(null);
     },

     char1(name, dom, num, seriesData, xAxisData) {
       //初始化ehcharts实例
       var myChart = echarts.init(document.getElementById(dom));
       var MyCubeRect = echarts.graphic.extendShape({
         shape: {
           x: 0,
           y: 0,
           width: 6, //柱宽
           zWidth: 2, //阴影折角宽
           zHeight: 3, //阴影折角高
         },
         buildPath: function (ctx, shape) {
           const api = shape.api;
           const xAxisPoint = api.coord([shape.xValue, 0]);
           const p0 = [shape.x, shape.y];
           const p1 = [shape.x - shape.width / 2, shape.y];
           const p4 = [shape.x + shape.width / 2, shape.y];
           const p2 = [xAxisPoint[0] - shape.width / 2, xAxisPoint[1]];
           const p3 = [xAxisPoint[0] + shape.width / 2, xAxisPoint[1]];

           ctx.moveTo(p0[0], p0[1]); //0
           ctx.lineTo(p1[0], p1[1]); //1
           ctx.lineTo(p2[0], p2[1]); //2
           ctx.lineTo(p3[0], p3[1]); //3
           ctx.lineTo(p4[0], p4[1]); //4
           ctx.lineTo(p0[0], p0[1]); //0
           ctx.closePath();
         }
       });
       var MyCubeShadow = echarts.graphic.extendShape({
         shape: {
           x: 0,
           y: 0,
           width: 6, //柱宽
           zWidth: 2, //阴影折角宽
           zHeight: 3, //阴影折角高
         },
         buildPath: function (ctx, shape) {
           const api = shape.api;
           const xAxisPoint = api.coord([shape.xValue, 0]);
           const p0 = [shape.x, shape.y];
           const p1 = [shape.x - shape.width / 2, shape.y];
           const p4 = [shape.x + shape.width / 2, shape.y];
           const p6 = [shape.x + shape.width / 2 + shape.zWidth, shape.y - shape.zHeight];
           const p7 = [shape.x - shape.width / 2 + shape.zWidth, shape.y - shape.zHeight];
           const p3 = [xAxisPoint[0] + shape.width / 2, xAxisPoint[1]];
           const p5 = [xAxisPoint[0] + shape.width / 2 + shape.zWidth, xAxisPoint[1] - shape.zHeight];

           ctx.moveTo(p4[0], p4[1]); //4
           ctx.lineTo(p3[0], p3[1]); //3
           ctx.lineTo(p5[0], p5[1]); //5
           ctx.lineTo(p6[0], p6[1]); //6
           ctx.lineTo(p4[0], p4[1]); //4

           ctx.moveTo(p4[0], p4[1]); //4
           ctx.lineTo(p6[0], p6[1]); //6
           ctx.lineTo(p7[0], p7[1]); //7
           ctx.lineTo(p1[0], p1[1]); //1
           ctx.lineTo(p4[0], p4[1]); //4
           ctx.closePath();
         }
       });
       echarts.graphic.registerShape('MyCubeRect', MyCubeRect);
       echarts.graphic.registerShape('MyCubeShadow', MyCubeShadow);
       let gradient = new echarts.graphic.LinearGradient(
         0, 1, 0, 0,
         [{
             offset: 0,
             color: '#13ACDE'
           },
           {
             offset: 1,
             color: '#0A77BD'
           }
         ]
       );
       let option = {
         ...tooltipObj,
         ...getTitle(name, num),
         grid: {
           ...gridObj,
           top: '25%',
         },
         xAxis: [{
           type: 'category',
           data: xAxisData,
           axisLabel: {
             interval: 0,
             // rotate: 40,
             ...fontSizeObj,
           },
           axisTick: {
             show: false, //刻度线
           },

           axisLine: {
             show: true, //坐标轴线
             lineStyle: {
               color: 'rgba(225,255,255,.1)',
               width: 1,
               // type: 'solid'
             },

           },

         }],
         yAxis: [{
           type: 'value',
           axisLabel: {
             ...fontSizeObj,
           },
           name: '(人)     ',
           nameGap: '2',
           nameTextStyle: {
             ...fontSizeObj,
             padding: [0, 0, 5, -14]
           },
           splitLine: {
             show: true, //网格线
             lineStyle: {
               color: 'rgba(255,255,255,0.1)'
             },
           },

         }],
         ...labelObj,
         series: [{
           type: 'custom',
           renderItem: function (params, api) {
             let location = api.coord([api.value(0), api.value(1)]);
             //  console.log(params, api);
             //  console.log(api.style());
             api.font(res => {
               //  console.log(res);
             });
             return {
               type: 'group',
               children: [{
                 type: 'MyCubeRect',
                 shape: {
                   api,
                   xValue: api.value(0),
                   yValue: api.value(1),
                   x: location[0],
                   y: location[1]
                 },
                 style: {
                   ...api.style(),
                   fill: gradient,
                   text: '',
                 },
               }, {
                 type: 'MyCubeShadow',
                 shape: {
                   api,
                   xValue: api.value(0),
                   yValue: api.value(1),
                   x: location[0],
                   y: location[1]
                 },
                 style: {
                   ...api.style(),
                   fill: gradient,
                 }
               }]
             };
           },
           data: seriesData
         }]
       };
       myChart.setOption(option);
     },
     char2(name, dom, num, seriesData, xAxisData) {
       //初始化ehcharts实例
       var myChart = echarts.init(document.getElementById(dom));
       let option = {
         ...tooltipObj,
         ...getTitle(name, num),
         grid: {
           ...gridObj,
           top: '15%',
           right: '10%',
         },
         xAxis: [{
           type: 'value',

           axisLabel: {
             interval: 0,
             // rotate: 40,
             ...fontSizeObj,
           },
           axisLine: {
             show: true, //坐标轴线
             lineStyle: {
               color: 'rgba(225,255,255,.1)',
               width: 1,
               // type: 'solid'
             },

           },
           axisTick: {
             show: false, //刻度线
           },
           splitLine: {
             show: false, //网格线
           },

         }],
         yAxis: [{
           type: 'category',
           axisLabel: {
             ...fontSizeObj,
           },
           inverse: true, //反向，相当于排序了
           data: xAxisData,
           axisTick: {
             show: false, //刻度线
           },
           axisLine: {
             show: true, //坐标轴线
             lineStyle: {
               color: 'rgba(225,255,255,.1)',
               width: 1,
               // type: 'solid'
             },

           },

         }],
         series: [{
           type: 'bar',
           barWidth: '60%',
           showBackground: true,
           backgroundStyle: {
             color: '#07486A',
             borderRadius: 4,
           },
           barWidth: 7,
           itemStyle: {
             borderRadius: 4,
             color: new echarts.graphic.LinearGradient(
               0, 0, 1, 0,
               [{
                   offset: 0,
                   color: '#914BFA'
                 },
                 {
                   offset: 1,
                   color: '#00BFDA'
                 }
               ]
             )
           },
           data: seriesData
         }]
       };
       myChart.setOption(option);
     },
     char3(name, dom, num, seriesData, xAxisData) {
       //初始化ehcharts实例
       var myChart = echarts.init(document.getElementById(dom));
       let colors = ['#8060F5', '#F57943', '#FFA93B', '#1A74FC', '#00B8A9']
       let option = {
         ...tooltipObj,
         ...getTitle(name, num),
         grid: {
           ...gridObj
         },
         xAxis: [{
           type: 'category',
           data: xAxisData,
           axisLabel: {
             interval: 0,
             // rotate: 40,
             ...fontSizeObj,
           },
           axisTick: {
             show: false, //刻度线
           },

           axisLine: {
             show: true, //坐标轴线
             lineStyle: {
               color: 'rgba(225,255,255,.1)',
               width: 1,
               // type: 'solid'
             },

           },

         }],
         yAxis: [{
           type: 'value',
           axisLabel: {
             ...fontSizeObj,
           },
           name: '(人)     ',
           nameGap: '2',
           nameTextStyle: {
             ...fontSizeObj,
             padding: [0, 0, 5, -14]
           },
           splitLine: {
             show: true, //网格线
             lineStyle: {
               color: 'rgba(255,255,255,0.1)'
             },
           },

         }],
         ...labelObj,
         series: [{
           //  name: "hill",
           type: "pictorialBar",
           barCategoryGap: "-100%",
           // symbol: 'path://M0,10 L10,10 L5,0 L0,10 z',
           symbol: "path://M0,10 L10,10 C5.5,10 5.5,5 5,0 C4.5,5 4.5,10 0,10 z",
           emphasis: {
             itemStyle: {
               opacity: 1
             }
           },
           data: seriesData,
           itemStyle: {
             normal: {
               //每个柱子的颜色即为colors数组里的每一项，如果柱子数目多于colors的长度，则柱子颜色循环使用该数组
               color: function (params) {
                 return colors[params.dataIndex];
               }
             },
           },
           // z: 10,

         }]
       };
       myChart.setOption(option);
     },
     char4(dom, seriesData, indicatorData) {
       //初始化ehcharts实例
       var myChart = echarts.init(document.getElementById(dom));
       let max = Math.max.apply(Math, seriesData);
       let data = [];
       indicatorData.map(o => data.push({
         text: o,
         max
       }));
       indicatorData = data;
       let option = {
         ...tooltipObj,
         //  ...getTitle(name, num),
         radar: [{
           indicator: indicatorData,
           radius: 50,
           name: {

             formatter: '{value}',
             textStyle: {
               ...fontSizeObj,
             }
           },
           nameGap: 5,
           axisLine: {
             //轴线相关
             lineStyle: {
               color: '#35C9F3',
               width: 0.5
             }
           },
           splitLine: {
             lineStyle: {
               color: '#35C9F3',
             }
           }

         }],
         series: [{
           type: 'radar',
           name: 'APP排名',
           areaStyle: {
             color: '#0FB4E4'
           },
           data: [{
             value: seriesData,
             // name: '某软件'
           }],
           symbolSize: 3,
           itemStyle: {
             //点的样式
             color: '#F0FF00'
           },
           lineStyle: {
             color: '#3ECEFC',
             width: 2
           },
         }]
       };
       myChart.setOption(option);
     },
     char5(obj) {
       let arr = [];
       obj.target.map((o, j) => arr.push({
         name: obj.dim[j],
         num: o,
       }));
       arr.map((o, i) => {
         this.sexList[i].num = o.num;
         this.sexList[i].width = this.getWidth(o.num);
         this.sexList[i].left = this.getWidth(o.num) + 10;
       });
       this.$refs.char5.sexList = this.sexList;
     },
     char6(dom, seriesData, xAxisData) {
       //初始化ehcharts实例
       var myChart = echarts.init(document.getElementById(dom));
       let data = [];
       seriesData.map((o, j) => data.push({
         value: o,
         name: xAxisData[j]
       }));
       seriesData = data;
       let colors = ['#F57943', '#FFA93B', '#1A74FC', '#39C5FF', '#08D241', '#FCD831', '#25F5CE', '#8160ED',
         '#00E3E3', '#CA8EFF', '#F57943', '#FFA93B', '#1A74FC', '#39C5FF', '#08D241', '#FCD831', '#25F5CE',
         '#8160ED', '#00E3E3', '#CA8EFF', '#F57943', '#FFA93B', '#1A74FC', '#39C5FF', '#08D241', '#FCD831',
         '#25F5CE', '#8160ED',
         '#00E3E3', '#CA8EFF', '#F57943', '#FFA93B', '#1A74FC', '#39C5FF', '#08D241', '#FCD831', '#25F5CE',
         '#8160ED',
         '#00E3E3', '#CA8EFF',
         '#F57943', '#FFA93B', '#1A74FC', '#39C5FF', '#08D241', '#FCD831', '#25F5CE', '#8160ED',
         '#00E3E3', '#CA8EFF'
       ]
       seriesData.map((o, i) => {
         o = Object.assign(o, {
           label: {
             show: true,
             color: colors[i],
             fontSize: 8
           },
           itemStyle: {
             color: colors[i],
           },
         });
       });
       let option = {
         ...tooltipObj,
         graphic: {
           elements: [{
             type: 'image',
             style: {
               image: './img/-e-组2608.png',
               width: '58',
               height: '58',
             },
             left: 'center',
             top: 'middle',
           }],
         },
         // legend: {
         //   top: '5%',
         //   left: 'center'
         // },
         series: [{
           // name: '访问来源',
           type: 'pie',
           radius: ['35%', '55%'],
           avoidLabelOverlap: false,
           //  minShowLabelAngle: 0,
           emphasis: {
             itemStyle: {
               shadowBlur: 10,
               shadowOffsetX: 0,
               shadowColor: 'rgba(0, 0, 0, 0.5)'
             }
           },
           label: {
             show: true,
             position: 'outside',
             fontSize: 8,
             color: '', //
             formatter: [
               '{name|{b}}',
               '{b| {d}%}'
             ].join('\n\n'),
             rich: {
               a: {
                 fontSize: '8',
               },
               b: {
                 ...fontSizeObj,
               }
             },
             padding: [0, -30, 0, -30],
           },
           labelLine: {
             show: true,
             length2: 25,
           },
           data: seriesData,
         }]
       };
       myChart.setOption(option);
     },
     char7(dom, seriesData, xAxisData) {
       //初始化ehcharts实例
       var myChart = echarts.init(document.getElementById(dom));
       let option = {
         ...tooltipObj,
         grid: {
           ...gridObj
         },
         xAxis: [{
           type: 'category',
           data: xAxisData,
           boundaryGap: false,
           axisLabel: {
             interval: 0,
             // rotate: 40,
             ...fontSizeObj,
           },
           axisLine: {
             show: true, //坐标轴线
             lineStyle: {
               color: 'rgba(225,255,255,.1)',
               width: 1,
               // type: 'solid'
             },

           },
           axisTick: {
             show: false, //刻度线
           },
           splitLine: {
             show: false, //网格线
           },

         }],
         yAxis: [{
           type: 'value',
           axisLabel: {
             ...fontSizeObj,
           },
           axisTick: {
             show: false, //刻度线
           },
           axisLine: {
             show: true, //坐标轴线
             lineStyle: {
               color: 'rgba(225,255,255,.1)',
               width: 1,
               // type: 'solid'
             },

           },
           splitLine: {
             show: false, //网格线
             lineStyle: {
               color: 'rgba(255,255,255,0.1)'
             },
           },

         }],
         ...labelObj,
         series: [{
           data: seriesData,
           type: 'line',
           smooth: true,
           symbolSize: 8, //设定实心点的大小
           itemStyle: {
             color: "#32FBEF", //改变折线颜色
           },
           areaStyle: {
             opacity: 0.1
           },
         }]
       };
       myChart.setOption(option);
     },
     getWidth(num) {
       return num ? num * 88 / 100 : 0;
     },
   },

 });