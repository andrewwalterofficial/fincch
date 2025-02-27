
const fillData = data => {

}

$(function () {
    $(document).on('click', 'li', function () {
        $('li').removeClass("active")
        $(this).addClass("active");
        let id = $(this).attr('id').split('rq')[1];

        if (id) {
            $(location).attr('href', '/request?id=' + id);
        }
    });

    $(document).on('click', '#accept-request', function (e) {
        e.preventDefault();
        let id = $('#accept-request').attr('data-id');
        $.get("/request/accept-request/" + id,
            function (data, textStatus, jqXHR) {
                console.log(data);

                if (data > 0) {
                    $(`#rq${id}`).remove();
                    alert('Thành công');
                    $('.content').remove();
                    // thêm vào lịch sử hoạt động
                }
            },
        );
    });
});