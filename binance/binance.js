	const crypto = require('crypto');
	const request = require('request');
	const querystring = require('querystring');
	var base_url = 'https://api.binance.com';

module.exports = class Binance{

	constructor(api_keys) 
	{
		this.keys = api_keys;
  	}


	getTime() {
		return new Date().getTime();
	}

	sign(queryString) 
	{
		return crypto.createHmac('sha256', this.keys['secretKey'])
			.update(queryString)
			.digest('hex');
	}

	assemble_url(base, path)
	{
		return base + path;
	}

	send_request(url, params, method, security, callback)
	{
		this.get_time(function(time){
			var options = {};
			if(security === 'SIGNED')
			{	
				params.timestamp = time;
				params.signature = this.sign(querystring.stringify(params));
			}
			if(!(security === 'NONE'))
			{	
				options.headers = {'X-MBX-APIKEY' : this.keys.apiKey};
			}
			url = url + '?' + querystring.stringify(params)
			options.url = url;
			options.method = method;
			request(options, function(error, response, body){
		  		let payload = JSON.parse(body);
		  		callback(payload);
		  	});
	  	}.bind(this));
	}

	//get balance
	get_balance(symbol, callback)
	{	
		var path = '/api/v3/account';
		var final_url = this.assemble_url(base_url, path);
		var params = {};
		this.send_request(final_url, params, 'GET', 'SIGNED', function(data){
			let symbol_data = data.balances.find(function(element) {
	  			return element.asset == symbol;
			});	
			let balance = symbol_data.free;
			callback(balance);
		}.bind(this));
	}

	//get price
	get_price(symbol, callback)
	{
		var path = '/api/v3/ticker/price';
		var params = {};
		params.symbol = symbol;
		var final_url = this.assemble_url(base_url, path);
		var response;
		//var response = send_request(final_url, params, 'GET', 'NONE')
		this.send_request(final_url, params, 'GET', 'NONE', function(data){
			callback(data['price']);
		});
	}

	order(action, symbol, quantity, callback)
	{
		var path = '/api/v3/order/test';
		var final_url = this.assemble_url(base_url, path);
		var params = 
		{
			'side': action,
			'type': 'MARKET',
		}
		params.symbol = symbol;
		params.quantity = quantity;
		this.send_request(final_url, params, 'POST', 'SIGNED', callback);

	}

	calculate_buy_quantity(symbol, btc_amount, callback)
	{
		this.get_lot_size(symbol, function(rounding_number)
		{
			var price_round = Math.log10(rounding_number[0].minPrice)*-1;
			var quant_round = Math.log10(rounding_number[1].minQty)*-1;
			this.get_price(symbol, function(price){
			console.log("The current price for the market " + symbol + " is " + price + " BTC");
			//set buy price to .01% above ask price & calculate how much you can buy
			let buy_price = price * 1.0001;
			//round down
			let rounder = Math.pow(10, quant_round);
			let buy_quant = Math.trunc((btc_amount/buy_price)*rounder)/rounder;
			console.log("Buy order for: " + buy_quant);
			callback(buy_quant);
			});
		}.bind(this));
	}

	buy(symbol, btc_amount, callback)
	{
		this.calculate_buy_quantity(symbol, btc_amount, function(buy_quant)
		{
			this.order('BUY', symbol, buy_quant, function(data)
			{
				callback(data);
			})
		}.bind(this));
	}

	get_lot_size(market, callback)
	{	
		var path = '/api/v1/exchangeInfo';
		var final_url = this.assemble_url(base_url, path);
		var params = {};
		this.send_request(final_url, params, 'GET', 'NONE', function(data){
			let market_data = data.symbols.find(function(element) {
	  			return element.symbol == market;
			});	
			let rounding_number = market_data.filters;
			callback(rounding_number);
		});
	}

	sell(market, callback)
	{
		this.get_lot_size(market, function(rounding_number)
		{
			var price_round = Math.log10(rounding_number[0].minPrice)*-1;
			var quant_round = Math.log10(rounding_number[1].minQty)*-1;
			var symbol = market.replace('BTC','');
			this.get_balance(symbol, function(balance){
				let rounder = Math.pow(10, quant_round);
				balance = Math.trunc(balance*rounder)/rounder;
				this.order('SELL', market, balance, function(data)
				{
					callback(data);
				});
			}.bind(this));
		}.bind(this));
	}

	get_time(callback)
	{
		var drift;
		var begin_time = this.getTime();
		var path = '/api/v1/time';
		var final_url = this.assemble_url(base_url, path);
		var options = {};
		options.url = final_url;
		options.method = 'GET';
		request(options, function(error, response, body){
	  		let data = JSON.parse(body);
	  		var end_time = this.getTime();
			drift = Math.trunc((begin_time - end_time)/2);
			callback(data.serverTime + drift);
	  	}.bind(this));
	}
}