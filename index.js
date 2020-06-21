
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const { getStockCurrentPrice } = require('./scraper');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pse-notifier-353a4.firebaseio.com'
});

// needs to initialize admin before passing it to db
const { getAlerts } = require('./db')(admin);

const getAlertNotifications = async () => {
  const alerts = await getAlerts();
  const stocks = [...new Set(alerts.map(alert => alert.symbol))];
  const prices = await Promise.all(stocks.map(getStockCurrentPrice));
  const stockPrices = stocks.reduce((accumulator, currentValue, index) => {
    accumulator[currentValue] = prices[index];
    return accumulator;
  }, {});
  
  return alerts.filter(alert => {
    const { symbol, price, isAbove } = alert;
    const currentPrice = stockPrices[symbol];

    if (isAbove) {
      return currentPrice >= price;
    }
    return currentPrice <= price;
  }); 
}

getAlertNotifications()
  .then(notifications => {
    // TODO: send the notifications to respective devices
  });
