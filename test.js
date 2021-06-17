const spawn = require("child_process").spawn;
const getsent = spawn("python3", ["sentiment.py", "SBIN:NSE"]);
getsent.stdout.on("data", function (data) {
  console.log(data.toString());
});
// const {spawn} = require('child_process')
// const script=spawn('python3',['./python/test.py',1,2])

// script.stdout.on('data',function(data){
//     console.log(data.toString())
// })

// const request = require('request')
// const cheerio = require('cheerio')
// request({
//     url: 'https://www.google.com/finance/quote/TCS:NSE',
//     headers: {
//         "accept":" */*",
//         "accept-encoding": "json",
//         "accept-language": "en-US"
//     },
//     json:true
//   },
//   function (error, response, body) {
//     if(error){
//         // console.log(err)
//     }
//     if(response && response.statusCode){
//         // console.log(response)
//     }
//     if(body){
//         var $ = cheerio.load(body)
//         let stock = $('div.fxKbKc').text()
//         console.log(stock)

//     }
// });

//     // unirest.get(`https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-historical-data`)
//     //     .query({
//     //         "symbol": "AMRN",
//     //         "region": "US"
//     //     })
//     //     .header({
//     //         "x-rapidapi-key": "5748f81eb8mshffbf41294fabf63p17ad8ajsnf763ad3e9d48",
//     //         "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
//     //         "useQueryString": true
//     //     })
//     //     .end(function (result) {
//     //         console.log(result.status, result.headers, result.body);
//     //     });
//     var req = unirest("GET", "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-historical-data");

//     req.query({
//         "symbol": "AMRN",
//         "region": "US"
//     });

//     req.headers({
//         "x-rapidapi-key": "8a4cf3263emsh902cc1db67cf981p1668a5jsnf87c86369a8c",
//         "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
//         "useQueryString": true
//     });

//     req.end(function (result) {
//         console.log(result.status, result.headers, result.body);

//     });
