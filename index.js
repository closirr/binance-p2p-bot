const tickerIndexes = { USDT: 1, BTC: 2, BNB: 3, BUSD: 4, ETH: 5, DAI: 6 };
const ANSWERS = require('./src/answers.js');
const median = require('./src/median.js');
const scrape = require('./src/scrape.js');
const introduction = require('./src/introduction.js');
const puppeteer = require('puppeteer');
const inquirer = require('inquirer');
const chalk = require('chalk');
const log = console.log;
const TelegramBot = require('node-telegram-bot-api');
var clients = {};

var requestStop = false;
var limit = 28.29;
var currentValue;
var currentChatId = '';

const token = '1851851427:AAG31OKFZkRaQeL5pdeExUSvQ3yCzZE8pG4';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "To start notifying when UAH more than 28.28 press Start");
  requestStop = false;

  bot.sendMessage(msg.chat.id, "You can set new limit by command /limit. Example /limit 28.15", {
    "reply_markup": {
      "keyboard": [["Start"], ["Stop"]]
    }
  });

});

bot.onText(/\Start/, (msg, match) => {
  const chatId = msg.chat.id;
  currentChatId = chatId;

  if (!clients[chatId]) {
    clients[chatId] = { limit: 28.28, enabled: true };
  }
  bot.sendMessage(msg.chat.id, "Notifications Enabled!");

});

bot.onText(/\Stop/, (msg, match) => {
  const chatId = msg.chat.id;
  if (clients[chatId]) {
    clients[chatId].enabled = false;
  bot.sendMessage(msg.chat.id, "Notifications Disabled!");
  }
});

bot.onText(/\/limit (.+)/, (msg, match) => {
  const resp = match[1];
  const newLimit = parseFloat(resp);
  if (newLimit) {
    limit = newLimit;
    const chatId = msg.chat.id;
    clients[chatId].limit = newLimit;
  bot.sendMessage(msg.chat.id, `New limit is ${newLimit}`);
  }

});
(async () => {

  const browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: [`--window-size=1400,800`] });

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
    https://p2p.binance.com/ru/trade/sell/USDT
    await page.waitForTimeout(1000);
    scrape(page).then((value) => {
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
            }

            client.isNewOrder = false;
            client.lastOrder = currentValue;
          }
        }

        page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        var newtime = 8000;
      }
      if (!requestStop) {
        setTimeout(multiStep, newtime);
      }
    })
  }

  await multiStep();
})();