const inquirer = require('inquirer');
const ui = new inquirer.ui.BottomBar();
const chalk = require('chalk');
const log = console.log;

async function extractedEvaluateCall(page) {
  return page.evaluate(() => {
    let data = [];
    let elements = document.querySelectorAll("#__APP > div.layout__Container-sc-1v4mjny-0.cRRZNA.scroll-container > main > div.css-16g55fu > div > div.css-vurnku > div");
    for (var element of elements) {
      let price = element.childNodes[0].childNodes[1].innerText.replace('\nARS', '').replace(/,/g, '');
      console.log(price);
      data.push(parseFloat(price));
    }
    return data;
  });
}

//div.css-kwfbf > div button:last-child
let scrape = async (page) => {
  let count = 0;
  let results = [];
  let firstScrap = true;
    await page.waitForTimeout(1000);
    // ui.updateBottomBar(`📄  ${chalk.bold(count)} ${chalk.grey(`${count > 1 ? 'pages indexed     ' : 'page indexed     '}`)} `);
    results = results.concat(await extractedEvaluateCall(page));
  
  return results;
};

module.exports = scrape;