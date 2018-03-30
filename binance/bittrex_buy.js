/*
This bot should recieve a market symbol, check btc balance, and use all available btc to purchase the coin
Steps:
check available btc
check the sell order price
put in a buy order for 1% more than the sell order 

*/

exports.buy = function(symbol, how_much_to_buy){
	var bittrex = require('node-bittrex-api');
	var config = require('./bittrex_keys.js');
	bittrex.options(config);
	var available_btc;
	var btc_amount = how_much_to_buy;

	//get btc balance
	bittrex.getbalance({ currency : 'BTC' }, function( data, err ) {
	  	if (err) {
	    	return console.error(err);
	  	}
	  	available_btc = data.result.Available;
	  	console.log("You have " + available_btc + " available");
	  	calculate(function(quantity, buyprice){
	  		console.log(quantity);
	  		console.log(buyprice);
	  		buy(quantity, buyprice);
	  	});
	});

	//calculate buy amount 
	function calculate(callback)
	{
		bittrex.getticker( { market : symbol }, function( data, err ) {
		if (err) {
	    return console.error(err);
		}
			let ask_price = data.result.Ask;
			console.log("The current price for the market " + symbol + " is " +ask_price + " BTC");
			//set buy price to 1% above ask price & calculate how much you can buy
			let buy_price = ask_price * 1.0001;
			console.log("This is our buy price: " + buy_price);
			let buy_quant = (btc_amount)/(buy_price);
			console.log("This is how much you can buy: " + buy_quant);
			callback(buy_quant, buy_price);
		})
	}

	function buy(quantity, buyprice)
	{
		bittrex.buylimit( {'market': symbol,'quantity': quantity, 'rate': buyprice}, function( data, err){
		if (err) {
	    return console.error(err);
	  	}
	  	console.log('buying');
		console.log(data);
		})
	}
}
