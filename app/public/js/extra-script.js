function changePassword() {
    $.ajax({
        type: "get",
        url: "/change-pass",
        data: {
            oldPassword: $(".changePassword input:first-child").val(),
            newPassword: $('.new-pass').val()
        },
        error: function(textstatus, errorThrown) {
            alert('text status ' + textstatus + ', err ' + errorThrown);
        }
    });
}

function findUser() {
    $.ajax({
        type: "get",
        url: "/find-user",
        data: {
            email: $('.find-user-input').val()
        },
        error: function (textstatus, errorThrown) {
            alert('text status ' + textstatus + ', err ' + errorThrown);
        }
    });
}

function changeEmail() {
    $.ajax({
        type: "get",
        url: "/change-email",
        data: {
            email: $('.input-email-change').val()
        },
        error: function (textstatus, errorThrown) {
            alert('text status ' + textstatus + ', err ' + errorThrown);
        }
    });
}

function changePhone() {
    $.ajax({
        type: "get",
        url: "/change-phone",
        data: {
            phone: $('.input-phone-change').val()
        },
        error: function (textstatus, errorThrown) {
            alert('text status ' + textstatus + ', err ' + errorThrown);
        }
    });
}

function createItem(){
    $.ajax({
        type: "post",
        url: "/create-item",
        data: {
            title: $('.itemTitle').val(),
            price: $('.itemPrice').val(),
            image: $('.itemImage').val()
        },
        error: function(textstatus, errorThrown) {
            alert('text status ' + textstatus + ', err ' + errorThrown);
        }
    });
}