const cheerio = require("cheerio");
const axios = require("axios");
const express = require("express");

async function getHighIBOVESPA() {
  try {
    const siteUrl = "https://www.infomoney.com.br/cotacoes/b3/indice/ibovespa/";
    const { data } = await axios({
      method: "GET",
      url: siteUrl,
    });

    const $ = cheerio.load(data);
    const elemSelector = "#high > tbody > tr";

    const keys = [
      "name",
      "price",
      "dayPercentage",
      "minValue",
      "maxValue",
      "date",
    ];

    const stockArr = [];

    $(elemSelector).each((parentIdx, parentElem) => {
      let keyIdx = 0;

      const stockObj = {};
      $(parentElem)
        .children()
        .each((childIdx, childElem) => {
          let tdValue = $(childElem).text();

          if (keyIdx === 1 || keyIdx === 2 || keyIdx === 3 || keyIdx === 4) {
            var strValue = $(childElem).text();
            strValue = strValue.replace(",", ".");

            tdValue = Number(strValue);
          }
          stockObj[keys[keyIdx]] = tdValue;
          keyIdx++;
        });
      stockArr.push(stockObj);
    });
    stockArr.sort((a, b) => {
      return b.price - a.price;
    });

    return stockArr;
  } catch (error) {
    console.log(error);
  }
}

const app = express();

app.get("/api/brazil-stocks", async (req, res) => {
  try {
    const stocks = await getHighIBOVESPA();
    return res.status(200).json({
      result: stocks,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.toString(),
    });
  }
});

app.listen(3333, () => {
  console.log("Running server on port 3333...");
});

getHighIBOVESPA();
