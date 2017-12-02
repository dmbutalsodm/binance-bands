const request  = require('request-promise');
const stats    = require('stats-lite');
const config   = require('./config.json');
const dateFormat = require('dateformat');
function average(array) {
    let total = 0;
    for(i = 0 ; i < array.length ; i++) {
        total += array[i];
    }
    return total / array.length;
}

function main() {
    delete pairs;
    let pairs = require('./pairs.json');
    for (i = 0 ; i < pairs.length ; i++) {
        let pair = pairs[i]
        const options = {
            uri: `https://www.binance.com/api/v1/klines?symbol=${pairs[i]}&interval=${config.interval}&limit=${config.limit}`,
            json: true,
        }
        console.log("\n".repeat(100));
        console.log("It's currently: " + dateFormat(new Date(), "h:MM:ss TT") + ", here are the currently tradeable pairs:");
        request(options).then(candlesticks => {
            const closingPrices = [];
            for (i = 0; i < candlesticks.length; i++) {
                closingPrices.push(parseFloat(candlesticks[i][config.mode]));
            }
            const movingAverage = average(closingPrices);
            const standardDeviation = stats.stdev(closingPrices);
            const bands = [movingAverage - (standardDeviation * config.deviation), movingAverage, movingAverage + (standardDeviation * config.deviation)];
            if (bands[2]/bands[0] > config.spread && closingPrices[20] < bands[0]*config.bottomTolerance) console.log(`${pair} may be tradeable!`);
        });
    }
}
main();
setInterval(main, config.runningInterval);





