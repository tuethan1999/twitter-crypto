var keys = require('./keys');
var Binance = require('./binance');
var binance = new Binance(keys);
var Twit = require('twit');
var config = require('./config');
var T = new Twit(config);
var username = 'EthanTu3';
var stream = T.stream('user', {username});
var bittrex = require('./bittrex_buy');
stream.on('tweet', run_bot);
var btc_quant = 0.001;

function run_bot(tweet) 
{	
	if(username == tweet.user.screen_name)
	{
		var endtick = 0;
		var ticker;
		var text = tweet.text;
		for (i = 0; i < text.length; i++) 
		{
			if(text.charAt(i) == ' ')
			{
				endtick = i;
				break;
			}
		}	
		var firstWord = text.substring(0, endtick);

		console.log('First Word: ' + firstWord);
		if(firstWord.charAt(0) == '$')
		{
			ticker = 'BTC-' + firstWord.substring(1, firstWord.length);
			symbol = firstWord.substring(1, firstWord.length) + 'BTC';
			if(text.includes('Binance'))
			{
				binance.buy(symbol, btc_quant, function(data)
					{
						console.log(data);
					});
			}
		}
		else if(firstWord == 'UPDATE:')
		{
			var begin = endtick + 1;
			var end;
			var spacecount = 0;
			if(text.charAt(begin) == '$')
			{
				for (i = begin; i < text.length; i++) 
				{
					if(text.charAt(i) == ' ')
					{
						end = i;
						break;
					}
				}	
				symbol = text.substring(begin+1, end) + 'BTC';
				binance.sell(symbol, function(data)
					{
						console.log(data);
					});
				ticker = 'BTC-' + text.substring(begin+1, end);
			}
		}
	}
}