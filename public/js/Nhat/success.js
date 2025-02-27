$(function () {
    var act = JSON.parse(localStorage.getItem('activityTransfer'));
    console.log(act)
    $('.pay-money').text(act.money + " " + act.currencyUnit);
    $('.to').text(act.stk);
});