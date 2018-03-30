exports.buy = function(symbol, how_much_to_buy){
const crypto = require('crypto');
const request = require('request');
const querystring = require('querystring');

var keys = require('./keys');
var base_url = 'https://api.binance.com';

function getTime() {
	return new Date().getTime();
}

function sign(queryString) 
{
	return crypto.createHmac('sha256', keys['secretKey'])
		.update(queryString)
		.digest('hex');
}

function assemble_url(base, path)
{
	return base + path;
}

function send_request(url, params, method, security, callback)
{
	var options = {};
	if(security === 'SIGNED')
	{
		var time = getTime();
		params.timestamp = time;
		params.signature = sign(querystring.stringify(params));
	}
	if(!(security === 'NONE'))
	{	
		options.headers = {'X-MBX-APIKEY' : keys.apiKey};
	}
	options.url = url;
	options.form = params;

	if(method === 'POST')
	{
		request.post(options, 
		function(error, response, body)
		{
	  		payload = JSON.parse(body);
	  		callback(payload);
	  	});
	}
	if(method === 'GET')
	{
		url = url + '?' + querystring.stringify(params)
		request(url, 
		function(error, response, body)
		{
			payload = JSON.parse(body);
			callback(payload);
	  	});	
	}
}

//get btc balance
function get_btc_balance()
{	var path = '/api/v3/account';
	var final_url = assemble_url(base_url, path);
	var params = {};
	send_request(final_url, params, 'GET', 'SIGNED');
}

//get price
function get_price(symbol, callback)
{
	var path = '/api/v3/ticker/price';
	var params = {};
	params.symbol = symbol;
	var final_url = assemble_url(base_url, path);
	var response;
	//var response = send_request(final_url, params, 'GET', 'NONE')
	send_request(final_url, params, 'GET', 'NONE', function(data){
		callback(data['price']);
	});
}

//test buy
function buy_symbol(symbol, quantity, callback)
{
	var path = '/api/v3/order/test';
	var final_url = assemble_url(base_url, path);
	var params = 
	{
		'side': 'BUY',
		'type': 'MARKET',
	}
	params.symbol = symbol;
	params.quantity = quantity;
	send_request(final_url, params, 'POST', 'SIGNED', callback);

}

function calculate_buy_quantity(symbol, btc_amount, callback)
{
	get_price(symbol, 
		function(price){
			console.log("The current price for the market " + symbol + " is " + price + " BTC");
			//set buy price to .01% above ask price & calculate how much you can buy
			let buy_price = price * 1.0001;
			console.log("This is the new buy price: " + buy_price);
			buy_quant = (btc_amount)/(buy_price);
			console.log("This is how much you can buy: " + buy_quant);
			callback(buy_quant);
	})
}

function buy(symbol, btc_amount, callback)
{
	calculate_buy_quantity(symbol, btc_amount, function(buy_quant)
	{
		buy_symbol(symbol,buy_quant, function(data)
		{
			if(data = {})
				console.log('placed buy order');
		})
	});
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//											TESTING BELOW!!!
////////////////////////////////////////////////////////////////////////////////////////////////////////////

buy(symbol, how_much_to_buy, function(){});
/*var price;
var response;
buy_symbol('LTCBTC', 25, function(data){
	response = data;
	console.log(response);

});
get_price('LTCBTC', function(data){
	price = data;
	console.log(price);
})
*/
//get_btc_balance();
}