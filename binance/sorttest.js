	

	var endtick = 0;
	var ticker = 'asdf';
	var text = '$LBC is looking hot right now! Get ready!';
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
		ticker = "BTC- " + text.substring(1, endtick);
		console.log(ticker);
	}