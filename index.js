import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import 'dotenv/config';
// Call config() method to load environment variables

const app = express();
const port = 3000;
const API_URL = "https://api.blockchain.com/v3/exchange/tickers";


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/",(req, res) => {
    res.render('index.ejs');
    
});

app.post('/check-price', async (req, res) => {
    function calculate24hChange(currentPrice, price24hAgo) {
        if (!price24hAgo || price24hAgo === 0) {
            return 0; 
        }
        
        const change = ((currentPrice - price24hAgo) / price24hAgo) * 100;
        return change.toFixed(2); 
    }
    function calculateMarketCap(currentPrice, circulatingSupply) {
        return currentPrice * circulatingSupply;
    }
    const cryptoSymbol = req.body.cryptoSymbol.toUpperCase(); 
    const apiKey = process.env.API_KEY; 

    try {
        const response = await axios.get('https://api.blockchain.com/v3/exchange/tickers', {
            headers: {
                'X-API-Token': apiKey
            }
        });

        const ticker = response.data.find(ticker => ticker.symbol === `${cryptoSymbol}`);
        
        if (ticker) {
            const currentPrice = ticker.last_trade_price;
            const price24hAgo = ticker.price_24h || ticker.open_24h; 
            const circulatingSupply = 18000000; 
            
            const change24h = calculate24hChange(currentPrice, price24hAgo);

            const marketCap = calculateMarketCap(currentPrice, circulatingSupply);
    
            res.render("index.ejs",{content :`$${ticker.last_trade_price}`, 
                                    Two4:`${ticker.price_24h}`,
                                    volume:`${ticker.volume_24h}`,
                                    cryptoName:`${ticker.symbol}`,
                                    percentage:`${change24h}%` ,
                                    MarketCap: `$${marketCap.toLocaleString()} USD`, 
                                                      data:response.data});
        }   
        else {
            res.send(`Ticker for ${cryptoSymbol} not found.`);
        }
    } catch (error) {
        console.error('Error fetching cryptocurrency price:', error);
        res.send('An error occurred while fetching the price.');
    }
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});