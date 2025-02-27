
// API URls
let dummyUrl = 'https://app.irecplus.com';
let realUrl = 'https://app.irecplus.com';
let baseUrl = realUrl;
let urlLocations = baseUrl + '/api/logistics/getlocations/';
let urlToStateLocations = baseUrl + '/api/logistics/gettostate/';
let urlFromStateLocations = baseUrl + '/api/logistics/getfromstate/';
let urlToCountryLocations = baseUrl + '/api/logistics/gettocountry/';
let urlFromCountryLocations = baseUrl + '/api/logistics/getfromcountry/';
let urlSaveOrder = baseUrl + '/api/Logistics/saveorder';
let urlTrackOrder = baseUrl + '/api/Logistics/TrackOrder/';

let realKey = "a1b69d47-ed30-4448-a5ea-52b3cd2be316";
let dummyKey = "a1b69d47-ed30-4448-a5ea-52b3cd2be316";
//let dummyKey = "ae318046-c75a-463d-baac-5abf50b365eb";

let Key = dummyKey; // Test Account Public key




$('#selectDel').on('change', function () {
    const interForm = document.querySelector(".rdf .international");
    const localForm = document.querySelector(".rdf .inter-state");
    const selectedValue = $('#selectDel').find(':selected').val();


    if (selectedValue == "International") {
        interForm.style.display = "block";

        localForm.style.display = "none";

    } else if (selectedValue == "Interstate") {
        interForm.style.display = "none";
        localForm.style.display = "block";
    } else {
        interForm.style.display = "none";
        localForm.style.display = "none";
    }

    $('select').niceSelect('update');
})



$(document).ready(function () {
    getLocations();
    getToStateLocations();
    getFromStateLocations();
    getFromCountryLocations();
    getToCountryLocations();
    getTrackingCode();
    //postOrder()
});






function postOrder() {

    let Orders = {};

    let fromCountry;
    let toCountry;
    let fromState;
    let toState;


    const selectedDelValue = $('#selectDel').find(':selected').val();

    if (selectedDelValue == "International") {

        fromCountry = $("#fromCountryDropdown").find(':selected').val()
        toCountry = $("#toCountryDropdown").find(':selected').val();

        fromState = " ";
        toState = " ";

    } else if (selectedDelValue == "Interstate") {

        fromState = $("#fromStateDropdown").find(':selected').val();
        toState = $("#toStateDropdown").find(':selected').val();

        fromCountry = " ";
        toCountry = " ";

    }



    Orders.SenderName = $("#SenderName").val();
    Orders.SenderPhoneNo = $("#SenderPhoneNo").val();
    Orders.ReceiverName = $("#ReceiverName").val();
    Orders.ReceiverPhoneNo = $("#ReceiverPhoneNo").val();
    Orders.ItemDescription = $("#ItemDescription").val();
    //Orders.ItemWeight = $("#ItemWeight").val();
    Orders.FromLocation = $("#FromLocation").val();
    Orders.ToLocation = $("#ToLocation").val();
    Orders.FromCountry = fromCountry;
    Orders.ToCountry = toCountry;
    Orders.FromState = fromState;
    Orders.ToState = toState;
    Orders.Note = $("#Note").val();
    Orders.ClosestBranchId = $("#locationDropdown").val();
    Orders.Publickey = Key;


    if (Orders.SenderName == "" || Orders.SenderPhoneNo == "" || Orders.ClosestBranchId == "") {
        alert("Please fill all necessary field before submitting")
        return;
    }


    $.ajax({
        async: true,
        type: 'Post',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(Orders),
        url: urlSaveOrder,
        beforeSend: function (xhr) {
            $("#SubmitBtn").attr("disabled", true);
            $('#siteBody').loadingOverlay(true, {
                backgroundColor: 'rgba(0,0,0,0.65)',
            });
        },
        success: function (data) {
            //  alert(data);
            var res = data.responseText;
            sessionStorage.setItem("trackingCode", res);
            window.location = '/ordersuccess?orderref=' + res;
        },
        complete: function () {
            $("#SubmitBtn").attr("disabled", false);
            $('#siteBody').loadingOverlay(false);
            //  alert("Gotten");
        },
        error: function (data) {
            var res = data.responseText;
            if (res.length == 10) {
                sessionStorage.setItem("trackingCode", res);
                window.location = '/ordersuccess?orderref=' + res;
            }
            else {
                alert("We couldnt process your order");

            }
            // window.location = '/ordersuccess';
        }
    })
}


function getTrackingCode() {
    var code = sessionStorage.getItem('trackingCode');
    document.getElementById("trackingNumber").value = code;
}



(function ($) {
    $.fn.loadingOverlay = function (status = true, options = {}) {
        var settings = $.extend(
            {
                icon: null,
                backgroundColor: 'rgba(255,255,255,0.85)',
            },
            options
        );

        const loadingEl = $(this);
        const loadingOverlay = $(`<div class="loading__overlay"></div>`);
        const loadingIcon = $('<span class="loading__icon"></span>');

        loadingOverlay.css({
            backgroundColor: settings.backgroundColor || 'rgba(255,255,255,0.85)',
            position: ['HTML', 'BODY'].includes(loadingEl.prop('tagName'))
                ? 'fixed'
                : 'absolute',
        });

        if (settings.icon)
            loadingIcon.css({
                backgroundImage: `url(${settings.icon})`,
            });

        loadingIcon.appendTo(loadingOverlay);

        if (status) {
            loadingEl.addClass('loading').prepend(loadingOverlay);
        } else {
            loadingEl.removeClass('loading');

            if (loadingEl.children().eq(0).hasClass('loading__overlay'))
                loadingEl.children().eq(0).remove();
        }
    };
})(jQuery);



function trackOrder() {

    var trackingno = $("#trackingNumber").val();
    if (trackingno.length != 10) {
        alert("please input a valid tracking number");
        return;
    }

    $.ajax({
        async: true,
        type: 'get',
        datatype: 'json',
        contenttype: 'application/json; charset=utf-8',
        data: { no: trackingno },
        url: urlTrackOrder + trackingno,
        success: function (data) {
            window.location = '/trackingstatus?on=' + data.orderNo + '&s=' + data.status + '&sn=' + data.senderName + '&dn=' + data.riderName + '&dno=' + data.riderPhone;
        }
    })
}


//Locations

let FromStateDropDown = $("#fromStateDropdown");
let ToStateDropDown = $("#toStateDropdown");
let FromCountryDropDown = $("#fromCountryDropdown");
let ToCountryDropDown = $("#toCountryDropdown");

function getLocations() {
    $.ajax({
        async: true,
        type: 'Get',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: { PK: Key },
        url: urlLocations + Key,
        success: function (data) {
            $('select').niceSelect();
            $.each(data, function (i, value) {
                $('#locationDropdown').append($('<option/>', {
                    value: value.id,
                    text: value.name
                }));
            });
            $('select').niceSelect('destroy');
            $('select').niceSelect();
        }
    })
}
function getToStateLocations() {

    $.ajax({
        async: true,
        type: 'Get',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: { PK: Key },
        url: urlToStateLocations + Key,
        success: function (data) {

            $('select').niceSelect();
            $.each(data, function (i, value) {
                ToStateDropDown.append($('<option/>', {
                    value: value.name,
                    text: value.name
                }));
            });
            $('select').niceSelect('destroy');
            $('select').niceSelect();
        }
    })
}
function getFromStateLocations() {

    $.ajax({
        async: true,
        type: 'Get',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: { PK: Key },
        url: urlFromStateLocations + Key,
        success: function (data) {

            $('select').niceSelect();
            $.each(data, function (i, value) {
                FromStateDropDown.append($('<option/>', {
                    value: value.name,
                    text: value.name
                }));
            });
            $('select').niceSelect('destroy');
            $('select').niceSelect();
        }
    })
}
function getFromCountryLocations() {

    $.ajax({
        async: true,
        type: 'Get',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: { PK: Key },
        url: urlFromCountryLocations + Key,
        success: function (data) {

            $('select').niceSelect();
            $.each(data, function (i, value) {
                FromCountryDropDown.append($('<option/>', {
                    value: value.name,
                    text: value.name
                }));
            });
            $('select').niceSelect('destroy');
            $('select').niceSelect();
        }
    })
}
function getToCountryLocations() {

    $.ajax({
        async: true,
        type: 'Get',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: { PK: Key },
        url: urlToCountryLocations + Key,
        success: function (data) {

            $('select').niceSelect();
            $.each(data, function (i, value) {
                ToCountryDropDown.append($('<option/>', {
                    value: value.name,
                    text: value.name
                }));
            });
            $('select').niceSelect('destroy');
            $('select').niceSelect();
        }
    })
}



//Style
const expand = document.getElementsByClassName("expand");
const fluid = document.getElementById("m-flu");
let mediumScreenSm = window.matchMedia("(min-width:576px) and (max-width: 661px)");
let mediumScreenLg = window.matchMedia("max-width: 767px;");

function mediaQueries(e) {
    if (e.matches) {
        //alert("hello");
        for (i = 0; i < expand.length; i++) {
            expand[i].classList.remove("col-sm-4");
            expand[i].classList.add("col-sm-12");
            expand[i].style.marginTop = "30px";

        }
    }
    else {
            //alert("doesn't match")

            for (i = 0; i < expand.length; i++) {
                expand[i].classList.remove("col-sm-12");
                expand[i].classList.add("col-sm-4");
                expand[i].style.marginTop = "inherit";

            }
    }
}

function mediaQueriesLg(e) {
     if (e.matches) {
            alert(" match large")
            fluid.classList.add("container-fluid");
            fluid.classList.remove("container");
     }
    else {
            alert("doesn't match")

            fluid.classList.remove("container-fluid");
            fluid.classList.add("container");
     }
}
mediumScreenSm.addListener(mediaQueries);
//mediumScreenLg.addListener(mediaQueries);

mediaQueries(mediumScreenSm);
//mediaQueriesLg(mediumScreenLg);