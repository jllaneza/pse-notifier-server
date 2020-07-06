const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.investagrams.com/Stock/';
const phisixBaseUrl = 'http://phisix-api4.appspot.com/';

const getCurrentPriceOfStock = async (stockCode) => {
  const response = await axios(`${url}${stockCode}`);
  const html = response.data;
  const $ = cheerio.load(html);
  return +$('#lblStockLatestLastPrice').text();
};

const getAllStocksCurrentPrice = async () => {
  const response = await axios(`${phisixBaseUrl}stocks.json`);
  return response.data.stock;
};

const getStocksCurrentPrice = async (stockCodes) => {
  let stockPrices = {};
  try {
    const prices = await Promise.all(stockCodes.map(getCurrentPriceOfStock));
    stockPrices = stockCodes.reduce((accumulator, currentValue, index) => {
      accumulator[currentValue] = prices[index];
      return accumulator;
    }, {});
  } catch(e) {
    // get prices from phisix in case of server error/timeout
    const prices = await getAllStocksCurrentPrice();
    stockPrices = prices.reduce((accumulator, currentValue) => {
      const { symbol, price } = currentValue;
      const { amount } = price;

      if (stockCodes.includes(symbol)) {
        accumulator[symbol] = amount;
      }
      return accumulator;
    }, {});
  }
  return stockPrices;
};

module.exports = {
  getStocksCurrentPrice
};