const showTransactionDetail = (amount, fee, total, from, to, message, date) => {
  $(`
    <div class="transaction-details">
    <div class="transaction-details__content row">
        <div class="col-sm-4">
            <div class="info">

                <div class="total">$557.20</div>
                <div class="date">
                    ${date}
                </div>
            </div>
        </div>
        <div class="col-sm-8">
           
            <div class="title flex j-between a-center">
                <h3> Transaction Details</h3>
                <span class="close-transactiondt" style="cursor:pointer">x</span>
            </div>
            <div class="detail__content">
            <div class="payment-amount flex j-between a-center trans-item">
                <p>Payment Amount</p>
                <p> $ ${amount}</p>
            </div>
            <div class="fee flex j-between a-center trans-item">
                <p>Fee</p>
                <p>-$ ${fee}</p>
            </div>
            <div class="total flex j-between a-center trans-item">
                <h3>Total Amount</h3>
                <p>$ ${total}</p>
            </div>
   
            <div class="from transaction-item">
                <h3>From: </h3>
                <p>${from}</p>
            </div>
            <div class="to transaction-item">
                <h3>To: </h3>
                <p>${to}</p>
            </div>
            <div class="transaction-item">
                <h3>Message</h3>
                <p>${message}</p>
            </div>
    </div>
        </div>
    </div>
</div>
    `).appendTo(".dashboard");
};

const fetchData = (url) => {
  const filterFrom = $("#filter-from").val();
  const filterTo = $("#filter-to").val();
};

$(function () {
  fetchData("123");
});

$(document).on("click", ".close-transactiondt", function (e) {
  $(".transaction-details").fadeOut(500);
});
$(document).on("click", ".transaction-details", function (e) {
  $(".transaction-details").fadeOut(500);
});

$(document).on("click", ".transaction-details__content", function (e) {
  e.stopPropagation();
});
