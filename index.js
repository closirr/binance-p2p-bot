const tickerIndexes = {
  USDT: 1,
  BTC: 2,
  BNB: 3,
  BUSD: 4,
  ETH: 5,
  DAI: 6
};
const scrape = require('./src/scrape.js');
const puppeteer = require('puppeteer');
const chalk = require('chalk');
const axios = require('axios')
const log = console.log;
const TelegramBot = require('node-telegram-bot-api');
var clients = {};

var requestStop = false;
var limit = 28.29;
var currentValue;
var currentChatId = '';

const token = '';
const bot = new TelegramBot(token, {
  polling: true
});

bot.onText(/\/start/, (msg) => {
  try {
    requestStop = false;
    bot.sendMessage(msg.chat.id, "To start notifying when UAH more than 28.28 press Start");

    bot.sendMessage(msg.chat.id, "You can set new limit by command /limit. Example: /limit 28.15", {
      "reply_markup": {
        "keyboard": [
          ["Start"],
          ["Stop"],
          ["GetCurrent"]
        ]
      }
    });
    bot.sendMessage(msg.chat.id, `You can take a look on price changing by the next link: 
    https://io.adafruit.com/closirr/feeds/binance-p2p-uah`);
  } catch (e) {
    console.log(e);
  }
});

bot.onText(/Start/, (msg, match) => {
  try {
    const chatId = msg.chat.id;
    currentChatId = chatId;

    if (!clients[chatId]) {
      clients[chatId] = {
        limit: 28.28,
        enabled: true
      };
    }
    bot.sendMessage(msg.chat.id, "Notifications Enabled!");
  } catch (e) {
    console.log(e);
  }
});

bot.onText(/\Stop/, (msg, match) => {
  try {
    const chatId = msg.chat.id;
    if (clients[chatId]) {
      clients[chatId].enabled = false;
      bot.sendMessage(msg.chat.id, "Notifications Disabled!");
    }
  } catch (e) {
    console.log(e);
  }
});

bot.onText(/\/limit (.+)/, (msg, match) => {
  try {
    const resp = match[1];
    const newLimit = parseFloat(resp);
    if (newLimit) {
      limit = newLimit;
      const chatId = msg.chat.id;
      clients[chatId].limit = newLimit;
      bot.sendMessage(msg.chat.id, `New limit is ${newLimit}`);
    }
  } catch (e) {
    console.log(e);
  }
});

function getCurrent(currentP2PRate) {
  return axios
    .get('https://api.binance.com/api/v3/depth?symbol=USDTUAH&limit=5')
    .then(res => {
      money = 29000;
      monoWithoutBinance = money - money/100 * 0.65;
      mono = monoWithoutBinance - monoWithoutBinance/100* 0.075;
      privat = mono - mono /100 * 0.5;
      monoRes = mono / res.data.asks[0][0] * currentP2PRate;
      privatRes = privat /res.data.asks[0][0] * currentP2PRate;

      return `profit if sell 29000UAH:
            p2p rate: ${currentP2PRate.toFixed(2)}
            marketValue: ${parseFloat(res.data.asks[0][0]).toFixed(2)}
            mono: ${monoRes.toFixed(2)}
            privat: ${privatRes.toFixed(2)}`
    })
    .catch(error => {
      console.error(error)
    })
}


bot.onText(/GetCurrent/, (msg, match) => {
  try {
    const chatId = msg.chat.id;
    currentChatId = chatId;

    if (!clients[chatId]) {
      clients[chatId] = {
        limit: 28.28
      };
    }

    getCurrent(currentValue).then(message =>
      bot.sendMessage(msg.chat.id, message)
    );

  } catch (e) {
    console.log(e);
  }
});



(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: [`--window-size=1400,800`]
    });

    const page = await browser.newPage();

    await page.goto(`https://p2p.binance.com/en/trade/${'Sell'.toLowerCase()}/${'USDT'.toLowerCase()}`);
    await page.waitForTimeout(1000);
    log('✅');


    var fiat = 'UAH';

    await page.waitForSelector('#C2Cfiatfilter_searhbox_fiat');
    await page.click('#C2Cfiatfilter_searhbox_fiat');
    await page.waitForTimeout(1000);
    await page.waitForSelector(`#${fiat}`);
    await page.click(`#${fiat}`);
    await page.waitForTimeout(1000);
    log('✅');
    isNewOrder = true;
    lastOrder = null;
    async function multiStep() {
      https: //p2p.binance.com/ru/trade/sell/USDT
        try {
          await page.waitForTimeout(1000);
          scrape(page).then((value) => {
            try {
              if (value[0]) {
                log(`3️⃣  ${chalk.bold.underline(`Here are the results of your query \n`)}`);
                // ui.updateBottomBar('');
                currentValue = value[0];
                log(`'Minimum price: '${currentValue.toLocaleString()}`);
                log(`${'Maximun price: '} ${value[value.length - 1].toLocaleString()}`);


                for (var key in clients) {
                  var client = clients[key];
                  if (currentValue != client.lastOrder) {
                    client.isNewOrder = true;
                  }
                }

                for (var key in clients) {
                  var client = clients[key];
                  if (client.isNewOrder && currentValue > client.limit) {
                    if (client.enabled) {
                      bot.sendMessage(key, `Order highter than ${client.limit} was found! - ${currentValue}UAH`);
                      getCurrent(currentValue).then(message =>
                        bot.sendMessage(key, message)
                      );
                      
                    }

                    client.isNewOrder = false;
                    client.lastOrder = currentValue;
                  }
                }

                page.reload({
                  waitUntil: ["networkidle0", "domcontentloaded"]
                });
                var newtime = 8000;
              }
              if (!requestStop) {
                setTimeout(multiStep, newtime);
              }
            } catch (e) {
              console.log(e);
            }
          })
          let axiosConfig = {
            headers: {
              'X-AIO-Key': 'fe38473bb28c4e9cb137587c65b16d4a',
              'Content-Type': 'application/json'
            }
          };

          if (currentValue) {
            try {
              await axios
                .post('https://io.adafruit.com/api/v2/closirr/feeds/binance-p2p-uah/data', {
                  "value": currentValue
                }, axiosConfig)
                .then(res => {})
                .catch(error => {
                  console.error(error)
                })
            } catch (e) {
              console.log(e);
            }
          }
        } catch (e) {
          console.log(e);
        }
    }
    try {
      await multiStep();
    } catch (e) {
      console.log(e);
    }
  } catch (e) {
    console.log(e);
  }
})();