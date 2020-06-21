
const admin = require('firebase-admin');
const cron = require('node-cron');
const serviceAccount = require('./serviceAccountKey.json');
const { getStocksCurrentPrice } = require('./scraper');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pse-notifier-353a4.firebaseio.com'
});

// needs to initialize admin before passing it to db
const { getAlerts } = require('./db')(admin);

const getAlertNotifications = async () => {
  const alerts = await getAlerts();
  const stocks = [...new Set(alerts.map(alert => alert.symbol))];
  const stockPrices = await getStocksCurrentPrice(stocks);
  console.log(stockPrices);
  return alerts.filter(alert => {
    const { symbol, price, isAbove } = alert;
    const currentPrice = stockPrices[symbol];

    if (isAbove) {
      return currentPrice >= price;
    }
    return currentPrice <= price;
  });
}

// schedule job to run every 15 seconds on weekdays from 9am - 1pm
cron.schedule('*/15 * 9-12 * * 1-5', () => {
  getAlertNotifications()
    .then(notifications => {
      // TODO: send the notifications to respective devices
      console.log(notifications)
    });
});