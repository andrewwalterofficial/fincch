var socket = io('https://dack-17ck1.herokuapp.com');
socket.on('server-send-client', data => {
    $.get("/api/get-account-default",
        function (data, textStatus, jqXHR) {
            if (data) {
                if ($('.money-avail').length > 0) {
                    $('.money-avail').text(data.balance);
                }
                $.get("api/account/infor",
                    function (data, textStatus, jqXHR) {
                        $('.list-credit-card').empty()
                        if (data.length > 0) {
                            data.forEach(element => {
                                $(` <div class="list-card-item col-xs-12 col-md-4">
                                    <div class="card ">
                                        <div class="flex a-center j-between">
                                            <div class="title">Pa<span>yy</span>ed</div>
                                            <p class="money" style="color:rgba(250, 250, 250, 0.8);font-weight: 700">$ ${element.balance}</p>
                                            </div>
    
                                        <div class="stk">${element.STK.match(/.{1,4}/g).join(' ')}</div>
                                        <div class="date flex a-center">
                                            <div class="tt">
                                                Valid<br>date :
                                            </div>
                                            <div class="sh">
                                                ${new Date(element.beginDate).toISOString().slice(0, 10)}
                                            </div>
    
                                        </div>
                                    </div>
                                    <div class="actions">
                                        <input type="radio" name="setDefault" id="" ${element.isDefault ? 'checked' : ''} onclick="setDefault(${element.STK}, ${element.userID})">
                                    </div>
                                </div>`).appendTo('.list-credit-card');
                            });
                        }
                        if (data.length == 0) {
                            $(` <a href="/create-credit-card"  class="requestCreditCard" style="margin-top:-50px; color:#30cb67">Yêu cầu tạo tài khoản ngân hàng</a>`).appendTo('.list-credit-card');
                        }
                    },
                );
            }
        },
    );
})