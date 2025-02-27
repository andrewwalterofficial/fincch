$(function () {

    const err = [{
        msg: 'demo'
    },
    {
        msg: 'demo'
    }
    ]
    const renderError = err => {

        const errors = err.map(item => {
            return `<p style="color:red; margin-bottom:10px">* ${item.msg}</p>`
        })
        $(`<div class="form-group" id="err">
        ${errors.join('')}
        </div>
        `).prependTo('.form-actions');
    }

    $('.btn-change-password').click(function (e) {
        e.preventDefault();
        const oldPassword = $('#oldPassword').val();
        const newPassword = $('#newPassword').val();
        const confirmPassword = $('#confirmPassword').val();

        if ($("#err")) {
            $("#err").remove();
        }
        if (oldPassword.length <= 0 || newPassword.length <= 0 || confirmPassword.length <= 0) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        } else {

            const newObj = {
                oldPassword,
                newPassword,
                confirmPassword
            }
            $.post("/change-password", newObj,
                function (data, textStatus, jqXHR) {
                    if (data == "1") {
                        alert('Đổi mật khẩu thành công');
                        $(location).attr('href', '/');
                    }
                    if (data == "-1") {
                        alert('Đã xảy ra lỗi');
                        $(location).attr('href', '/');
                    }
                    renderError(data)
                },
            );
        }
    })
});