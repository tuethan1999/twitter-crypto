
console.log('start');
var Twit = require('twit');
var config = require('./config');
var T = new Twit(config);
var username = 'Metis_AI';
var stream = T.stream('user', {username});
var thebot = require('/Users/azncy/trading/bittrex/buybot.js');
stream.on('tweet', dowork);
function dowork(tweet) 
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
		ticker = "BTC-" + text.substring(1, endtick);
		console.log(ticker);
		thebot.buytheticker(ticker);

	}

}
