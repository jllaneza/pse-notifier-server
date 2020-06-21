const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.investagrams.com/Stock/';

const getStockCurrentPrice = async (stockCode) => {
  const response = await axios(`${url}${stockCode}`);
  const html = response.data;
  const $ = cheerio.load(html);
  return +$('#lblStockLatestLastPrice').text();
};

module.exports = {
  getStockCurrentPrice
};