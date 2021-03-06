const mongoose = require("mongoose");
const User = require("../model/User");
const Stock = require("../model/Stock");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const dotenv = require("dotenv");
const request = require("request");
const cheerio = require("cheerio");
dotenv.config({
  path: "./config.env",
});
const unirest = require("unirest");
const API_KEY = process.env.API_KEY;

require("../auth/passport")(passport);
require("../auth/auth");

//Stock Data
var NSE = [
  "RELIANCE:NSE",
  "TCS:NSE",
  "HDFC:NSE",
  "INFY:NSE",
  "HINDUNILVR:NSE",
  "ICICIBANK:NSE",
  "SBIN:NSE",
  "YESBANK:NSE",
  "ITC:NSE",
  "ADANITRANS:NSE",
  "COALINDIA:NSE",
  "BAJFINANCE:NSE",
  "KOTAKBANK:NSE",
  "FB:NASDAQ",
  "AAPL:NASDAQ",
  "WIPRO:NSE",
  "HCLTECH:NSE",
  "ASIANPAINT:NSE",
  "AMZN:NASDAQ",
  "ADANIENT:NSE",
  "MSCI:NYSE",
  "TSLA:NASDAQ",
  "MSFT:NASDAQ",
  "BABA:NYSE",
  "AMJ:NYSEARCA",
];
setInterval(() => {
  NSE.forEach((item, index) => {
    request(
      {
        url: `https://www.google.com/finance/quote/${item}`,
        headers: {
          accept: " */*",
          "accept-encoding": "json",
          "accept-language": "en-US",
        },
        json: true,
      },
      function (error, response, body) {
        if (error) {
          // console.log(err)
        }
        if (body) {
          var $ = cheerio.load(body);
          let price = $(
            "#yDmH0d > c-wiz > div > div.e1AOyf > main > div.VfPpkd-WsjYwc.VfPpkd-WsjYwc-OWXEXe-INsAgc.KC1dQ.Usd1Ac.AaN0Dd.QZMA8b > c-wiz > div > div:nth-child(1) > div > div.rPF6Lc > div:nth-child(1) > div > div:nth-child(1) > div > span > div > div"
          ).text();
          let title = $(
            "#yDmH0d > c-wiz.zQTmif.SSPGKf.u5wqUe > div > div.e1AOyf > main > div.VfPpkd-WsjYwc.VfPpkd-WsjYwc-OWXEXe-INsAgc.KC1dQ.Usd1Ac.AaN0Dd.QZMA8b > c-wiz > div > div:nth-child(1) > div > div.rPF6Lc > div:nth-child(1) > h1"
          ).text();
          // console.log(price)
          const newStock = new Stock({
            symbol: item,
            stock: title,
            price: price,
          });
          Stock.findOne({ symbol: item }).then((data) => {
            if (data) {
              Stock.findOneAndUpdate({ symbol: item }, { price: price })
                .then((data) => {
                  //console.log(data.price);
                })
                .catch((err) => console.log(err));
            } else {
              newStock
                .save()
                .then((data) => {
                  if (data) {
                    console.log("Saved Successfully");
                  }
                })
                .catch((err) => console.log("something went wrong"));
            }
          });
        }
      }
    );
  });
}, 600000);

//DEFINING Home ROUTE
var getHome = function (req, res) {
  res.render("index", {
    name: req.user,
  });
};

//DEFINING HOME ROUTE
var getLearn = function (req, res) {
  res.render("learn", {
    name: req.user,
  });
};

//DEFINING HOME ROUTE
var getMarket = function (req, res) {
  Stock.find({})
    .then((data) => {
      // console.log(data[0])
      res.render("market", {
        name: req.user,
        data: data,
      });
    })
    .catch((err) => console.log(err));
};

//DEFINING Prediction ROUTE
var getPrediction = function (req, res) {
  res.render("prediction", {
    name: req.user,
    prediction: "default",
  });
};

//DEFINING LOGIN ROUTE
var getLogin = function (req, res) {
  res.render("login");
};

//DEFINING SIGNUP ROUTE
var getSignup = function (req, res) {
  res.render("signup");
};

//DEFINING LOGOUT ROUTE
var getLogout = function (req, res) {
  req.logout();
  req.flash("success_msg", "Logged out Successfully");
  res.redirect("/login");
};

//DEFINING THE POSTS ROUTE

//DEFINING LOGIN ROUTE
var postSignup = function (req, res) {
  const { name, email, pswd, cnfpswd } = req.body;
  let error = [];
  if (!name || !email || !pswd || !cnfpswd) {
    error.push({
      msg: "All field Required",
    });
  }
  if (pswd !== cnfpswd) {
    error.push({
      msg: "Password Dont Match",
    });
  }
  if (pswd.length < 6) {
    error.push({
      msg: "Password Should be at least  6 character",
    });
  }
  if (error.length > 0) {
    res.render("signup", {
      error,
      name,
      email,
      pswd,
      cnfpswd,
    });
  } else {
    User.findOne({
      email: email,
    }).then((user) => {
      if (user) {
        error.push({
          msg: "User Already Existed",
        });
        res.render("signup", {
          name,
          email,
          pswd,
          cnfpswd,
        });
      } else {
        const newUser = new User({
          name,
          email,
          pswd,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.pswd, salt, (err, hash) => {
            if (err) throw err;
            newUser.pswd = hash;
            newUser
              .save()
              .then((user) => {
                req.flash("success_msg", "User Registered Successfully");
                res.redirect("/login");
              })
              .catch((err) => {
                console.log(err);
              });
          });
        });
      }
    });
  }
};

//DEFINING LOGIN ROUTE
var postLogin = function (req, res, next) {
  const { email, pswd } = req.body;
  if (!email || !pswd) {
    req.flash("error_msg", "All Field Required");
    res.redirect("/login");
  } else {
    passport.authenticate("local", {
      successRedirect: "/prediction",
      failureRedirect: "/login",
      failureFlash: true,
    })(req, res, next);
  }
};

var postPrediction = function (req, res) {
  var ticker = req.body.stock;
  const { spawn } = require("child_process");

  if (ticker == "none") {
    req.flash("error_msg", "Please Select Stock");
    res.redirect("/prediction");
  } else {
    if (ticker == "ICICIBANK.NS") {
      let folder = "icici";
      const script = spawn("python3", ["testing.py", ticker, folder]);

      script.stdout.on("data", function (data) {
        predict = parseFloat(data.toString()).toFixed(2);
        Stock.findOne({ symbol: "ICICIBANK:NSE" })
          .then((data) => {
            if (data) {
              console.log(data);
              company = ticker;
              current = data.price;
              const getsent = spawn("python3", ["sentiment.py", "ICICIBANK:NSE"]);
              getsent.stdout.on("data", function (data) {
                // console.log(data.toString());
                range = data.toString();
                var arr = new Array();
                arr = range.split(",");
                for(let i=0;i<arr.length;i++){
                    arr[i]=parseFloat(Math.floor(arr[i]))
                }
                // console.log(arr[0]);
                res.render("prediction", {
                  prediction: predict,
                  stock: company,
                  current: current,
                  name: req.user,
                  range: arr,
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    } else if (ticker == "TCS.NS") {
      let folder = "tcs";
      const script = spawn("python3", ["testing.py", ticker, folder]);
      script.stdout.on("data", function (data) {
        predict = parseFloat(data.toString()).toFixed(2);
        Stock.findOne({ symbol: "TCS:NSE" })
          .then((data) => {
            if (data) {
              console.log(data);
              company = ticker;
              current = data.price;
              const getsent = spawn("python3", ["sentiment.py", "TCS:NSE"]);
              getsent.stdout.on("data", function (data) {
                // console.log(data.toString());
                range = data.toString();
                var arr = new Array();
                arr = range.split(",");
                for(let i=0;i<arr.length;i++){
                    arr[i]=parseFloat(Math.floor(arr[i]))
                }
                // console.log(arr[0]);
                res.render("prediction", {
                  prediction: predict,
                  stock: company,
                  current: current,
                  name: req.user,
                  range: arr,
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    } else if (ticker == "INFY.NS") {
      let folder = "infy";
      const script = spawn("python3", ["testing.py", ticker, folder]);

      script.stdout.on("data", function (data) {
        predict = parseFloat(data.toString()).toFixed(2);
        Stock.findOne({ symbol: "INFY:NSE" })
          .then((data) => {
            if (data) {
              console.log(data);
              company = ticker;
              current = data.price;
              const getsent = spawn("python3", ["sentiment.py", "INFY:NSE"]);
              getsent.stdout.on("data", function (data) {
                // console.log(data.toString());
                range = data.toString();
                var arr = new Array();
                arr = range.split(",");
                for(let i=0;i<arr.length;i++){
                    arr[i]=parseFloat(Math.floor(arr[i]))
                }
                // console.log(arr[0]);
                res.render("prediction", {
                  prediction: predict,
                  stock: company,
                  current: current,
                  name: req.user,
                  range: arr,
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    } else if (ticker == "RELIANCE.NS") {
      let folder = "reliance";
      const script = spawn("python3", ["testing.py", ticker, folder]);

      script.stdout.on("data", function (data) {
        predict = parseFloat(data.toString()).toFixed(2);
        Stock.findOne({ symbol: "RELIANCE:NSE" })
          .then((data) => {
            if (data) {
              console.log(data);
              company = ticker;
              current = data.price;
              const getsent = spawn("python3", ["sentiment.py", "RELIANCE:NSE"]);
              getsent.stdout.on("data", function (data) {
                // console.log(data.toString());
                range = data.toString();
                var arr = new Array();
                arr = range.split(",");
                for(let i=0;i<arr.length;i++){
                    arr[i]=parseFloat(Math.floor(arr[i]))
                }
                // console.log(arr[0]);
                res.render("prediction", {
                  prediction: predict,
                  stock: company,
                  current: current,
                  name: req.user,
                  range: arr,
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    } else if (ticker == "HDFC.NS") {
      let folder = "hdfc";
      const script = spawn("python3", ["testing.py", ticker, folder]);

      script.stdout.on("data", function (data) {
        predict = parseFloat(data.toString()).toFixed(2);
        Stock.findOne({ symbol: "HDFC:NSE" })
          .then((data) => {
            if (data) {
              console.log(data);
              company = ticker;
              current = data.price;
              const getsent = spawn("python3", ["sentiment.py", "HDFC:NSE"]);
              getsent.stdout.on("data", function (data) {
                // console.log(data.toString());
                range = data.toString();
                var arr = new Array();
                arr = range.split(",");
                for(let i=0;i<arr.length;i++){
                    arr[i]=parseFloat(Math.floor(arr[i]))
                }
                // console.log(arr[0]);
                res.render("prediction", {
                  prediction: predict,
                  stock: company,
                  current: current,
                  name: req.user,
                  range: arr,
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    } else if (ticker == "HINDUNILVR.NS") {
      let folder = "hindustan";
      const script = spawn("python3", ["testing.py", ticker, folder]);

      script.stdout.on("data", function (data) {
        predict = parseFloat(data.toString()).toFixed(2);
        Stock.findOne({ symbol: "HINDUNILVR:NSE" })
          .then((data) => {
            if (data) {
              console.log(data);
              company = ticker;
              current = data.price;
              const getsent = spawn("python3", ["sentiment.py", "HINDUNILVR:NSE"]);
              getsent.stdout.on("data", function (data) {
                // console.log(data.toString());
                range = data.toString();
                var arr = new Array();
                arr = range.split(",");
                for(let i=0;i<arr.length;i++){
                    arr[i]=parseFloat(Math.floor(arr[i]))
                }
                // console.log(arr[0]);
                res.render("prediction", {
                  prediction: predict,
                  stock: company,
                  current: current,
                  name: req.user,
                  range: arr,
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    } else if (ticker == "SBIN.NS") {
      let folder = "sbi";
      const script = spawn("python3", ["testing.py", ticker, folder]);
      script.stdout.on("data", function (data) {
        predict = parseFloat(data.toString()).toFixed(2);
        Stock.findOne({ symbol: "SBIN:NSE" })
          .then((data) => {
            if (data) {
            //   console.log(data);
              company = ticker;
              current = data.price;

              const getsent = spawn("python3", ["sentiment.py", "SBIN:NSE"]);
              getsent.stdout.on("data", function (data) {
                // console.log(data.toString());
                range = data.toString();
                var arr = new Array();
                arr = range.split(",");
                for(let i=0;i<arr.length;i++){
                    arr[i]=parseFloat(Math.floor(arr[i]))
                }
                // console.log(arr[0]);
                res.render("prediction", {
                  prediction: predict,
                  stock: company,
                  current: current,
                  name: req.user,
                  range: arr,
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    } 
    else if (ticker == "ITC.NS") {
      let folder = "itc";
      const script = spawn("python3", ["testing.py", ticker, folder]);
      script.stdout.on("data", function (data) {
        predict = parseFloat(data.toString()).toFixed(2);
        Stock.findOne({ symbol: "ITC:NSE" })
          .then((data) => {
            if (data) {
            //   console.log(data);
              company = ticker;
              current = data.price;

              const getsent = spawn("python3", ["sentiment.py", "ITC:NSE"]);
              getsent.stdout.on("data", function (data) {
                // console.log(data.toString());
                range = data.toString();
                var arr = new Array();
                arr = range.split(",");
                for(let i=0;i<arr.length;i++){
                    arr[i]=parseFloat(Math.floor(arr[i]))
                }
                // console.log(arr[0]);
                res.render("prediction", {
                  prediction: predict,
                  stock: company,
                  current: current,
                  name: req.user,
                  range: arr,
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }
    else if (ticker == "ADANITRANS.NS") {
      let folder = "adani";
      const script = spawn("python3", ["testing.py", ticker, folder]);
      script.stdout.on("data", function (data) {
        predict = parseFloat(data.toString()).toFixed(2);
        Stock.findOne({ symbol: "ADANITRANS:NSE" })
          .then((data) => {
            if (data) {
            //   console.log(data);
              company = ticker;
              current = data.price;

              const getsent = spawn("python3", ["sentiment.py", "ADANITRANS:NSE"]);
              getsent.stdout.on("data", function (data) {
                // console.log(data.toString());
                range = data.toString();
                var arr = new Array();
                arr = range.split(",");
                for(let i=0;i<arr.length;i++){
                    arr[i]=parseFloat(Math.floor(arr[i]))
                }
                // console.log(arr[0]);
                res.render("prediction", {
                  prediction: predict,
                  stock: company,
                  current: current,
                  name: req.user,
                  range: arr,
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }
    else if (ticker == "KOTAKBANK.NS") {
      let folder = "kotak";
      const script = spawn("python3", ["testing.py", ticker, folder]);
      script.stdout.on("data", function (data) {
        predict = parseFloat(data.toString()).toFixed(2);
        Stock.findOne({ symbol: "KOTAKBANK:NSE" })
          .then((data) => {
            if (data) {
            //   console.log(data);
              company = ticker;
              current = data.price;

              const getsent = spawn("python3", ["sentiment.py", "KOTAKBANK:NSE"]);
              getsent.stdout.on("data", function (data) {
                // console.log(data.toString());
                range = data.toString();
                var arr = new Array();
                arr = range.split(",");
                for(let i=0;i<arr.length;i++){
                    arr[i]=parseFloat(Math.floor(arr[i]))
                }
                // console.log(arr[0]);
                res.render("prediction", {
                  prediction: predict,
                  stock: company,
                  current: current,
                  name: req.user,
                  range: arr,
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }else if (ticker == "HCLTECH.NS") {
      let folder = "hcl";
      const script = spawn("python3", ["testing.py", ticker, folder]);
      script.stdout.on("data", function (data) {
        predict = parseFloat(data.toString()).toFixed(2);
        Stock.findOne({ symbol: "HCLTECH:NSE" })
          .then((data) => {
            if (data) {
            //   console.log(data);
              company = ticker;
              current = data.price;

              const getsent = spawn("python3", ["sentiment.py", "HCLTECH:NSE"]);
              getsent.stdout.on("data", function (data) {
                // console.log(data.toString());
                range = data.toString();
                var arr = new Array();
                arr = range.split(",");
                for(let i=0;i<arr.length;i++){
                    arr[i]=parseFloat(Math.floor(arr[i]))
                }
                // console.log(arr[0]);
                res.render("prediction", {
                  prediction: predict,
                  stock: company,
                  current: current,
                  name: req.user,
                  range: arr,
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }
    else {
      predict = "dev";
      res.render("prediction", {
        prediction: predict,
        name: req.user,
      });
    }
  }
};

//EXPORTING THE CONTROLLER FUNCTIONS

module.exports = {
  getHome,
  getLearn,
  getMarket,
  getPrediction,
  getSignup,
  getLogin,
  postSignup,
  postLogin,
  getLogout,
  postPrediction,
};
