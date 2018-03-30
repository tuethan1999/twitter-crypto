var binance = require('./binance_buy.js');
var Twit = require('twit');
var config = require('./config');
var T = new Twit(config);
var username = 'EthanTu3';
var stream = T.stream('user', {username});
var bittrex = require('./bittrex_buy.js');
stream.on('tweet', buy_something);

btc_quant = .2;
function buy_something(tweet) 
{	
	var endtick = 0;
	var ticker;
	var text = tweet.text;
	if(text.charAt(0) == '$')
	{
		for (i = 0; i < text.length; i++) 
		{
			if(text.charAt(i) == ' ')
			{
				endtick = i;
				break;
			}
		}	
		ticker = 'BTC-' + text.substring(1, endtick);
		symbol = text.substring(1, endtick) + 'BTC';
		console.log(ticker);
		console.log(symbol);
		bittrex.buy(ticker, btc_quant);
		binance.buy(symbol, btc_quant);

	}

}