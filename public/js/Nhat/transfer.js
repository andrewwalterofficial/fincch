
socket = io('https://dack-17ck1.herokuapp.com/');

const addError = content => {
    $(`
    <div class="form-group mt-10 error">
    <p class="red">* ${content}</p>
</div>
    `).appendTo('form');
}
$(function () {
    $('#btnContinue').click(async function (e) {
        e.preventDefault();
        const money = $('#txtMoney').val();
        const currencyUnit = $('#currencyUnit').val();
        const bankCode = $('#bankCode').val();
        const stk = $('#txtCardNumber').val();
        const message = $('#txtMessage').val();

        if (!money || !currencyUnit || !bankCode || !stk || !message) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }
        else {
            $('.pop-up').fadeIn(300);
        }
    })
});
// socket.on("server-said", data => {
//     //demo
//     $('#txtCardNumber').val(data);
// });