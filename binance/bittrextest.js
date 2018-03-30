var binance = require('./binance_buy.js');
var symbol = 'LTCBTC';
binance.buy(symbol);

var bittrex = require('./bittrex_buy.js');
var ticker = 'BTC-LTC'; 
bittrex.buy(ticker);