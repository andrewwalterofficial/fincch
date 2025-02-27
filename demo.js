const moment = require('moment')

function calculatorProfit(term, beginDate, balance) {
    const months = moment().diff(beginDate, "months");
    const day = moment().diff(beginDate, 'days');

    let percent = 0;
    if (term >= 0 && term <= 1) percent = 0.05;
    else if (term < 3) percent = 0.05;
    else if (term < 6) percent = 0.15;
    else if (term < 9) percent = 0.35;
    else if (term >= 9) percent = 0.5;

    if (months < term) percent *= 0.5; // neu rut tien truoc thoi han

    const max = (balance + (balance * percent)).toFixed(4) // so tien toi da duoc nhan neu dung han

    const currentProfit = (balance * percent * (day / 360)).toFixed(4);

    let profit = currentProfit > percent ? percent : currentProfit
    profit = profit < 0 ? 0 : profit;

    return {
        profit,
        total: (Number(balance) + Number(profit)).toFixed(4),
    }
}

