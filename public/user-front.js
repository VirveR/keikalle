// Authentication area in index.handlebars

function toggleSignInForm() {
    $('#openLoginFormButton').addClass('active_button');
    $('#openSignupFormButton').removeClass('active_button');
    $('#loginForm').slideDown(500);
    $('#signupForm').hide(500);
}

function toggleSignUpForm() {
    $('#openSignupFormButton').addClass('active_button');
    $('#openLoginFormButton').removeClass('active_button');
    $('#signupForm').slideDown(500);
    $('#loginForm').hide(500);
}

function closeAuthenticationArea() {
    $('#signupForm').hide(500);
    $('#loginForm').hide(500);
    $('#openLoginFormButton').removeClass('active_button');
    $('#openSignupFormButton').removeClass('active_button');
}

function closeInfoBox() {
    $('#error-box').hide(500);
}

function removeProfilePicture() {
    const userId = $('#userIdForPictureUpload').val();
    const path = $('#profilePicture').attr('src').split('/');
    const fileName = path[path.length-1];
    if(fileName === 'kale.png'){
        alert('Sinulla ei ole ladattua profiilikuvaa');
    }
    else{
        $.ajax({
            url: '/profile/delete/profilepic',
            type: 'POST',
            data: {
                id: userId,
                imgSrc: fileName
            },
            success: function(){
                console.log("Profile image deleted");
                location.reload()
            }
        });
    }
}

$(document).on('click', '.registerToEvent', function() {
    const eventId = this.id.split("_")[1];
    $.ajax({
        url: '/registerToEvent',
        type: 'POST',
        data: {eventId: eventId},
        success: function(data){
            if(data.added){
                location.reload();
                console.log("registered to event");
            }
            else{
                console.log("registration to event failed");
            }
        }
    });
});


$(document).on('click', '.unRegisterFromEvent', function() {
    const eventId = this.id.split("_")[1];
    alert(eventId);
    /*
    $.ajax({
        url: '/registerToEvent',
        type: 'POST',
        data: {eventId: eventId},
        success: function(data){
            if(data.added){
                location.reload();
                console.log("registered to event");
            }
            else{
                console.log("registration to event failed");
            }
        }
    });*/
});



$(document).on('click', '#show-all-btn', function() {
    $('#search_performer').val("");
    $('#search_city').val("");
    $('#search_place').val("");
});

// Registration form validations
//Checking if alias is reserved in database
$(document).on('input', '#signup_alias', function() {
    let alias = $('#signup_alias').val();
    if (alias.length > 2 && alias.length < 21){
        $.ajax({
            url: '/user/get_if_alias/'+alias,
            type: "GET",
            data: {
                alias: alias
            },
            success: function(data){
                if(data.found){
                    $('#signup_alias').css('background-color', 'red');
                    $('#signup_alias_ok').val(0);
                    $('#alias_validation').text('Nimimerkki on jo varattu');
                    validateAllSignUpFileds();
                }
                else{
                    $('#signup_alias').css('background-color', 'lightgreen');
                    $('#signup_alias_ok').val(1);
                    $('#alias_validation').text('nimerkki on vapaa');
                    validateAllSignUpFileds();
                }
            }
        });
    }
    else if(alias.length > 20) {
        $('#signup_alias').css('background-color', 'red');
        $('#signup_alias_ok').val(0);
        $('#alias_validation').text('Nimimerkin tulisi olla enintään 20 merkkiä pitkä');
        validateAllSignUpFileds();
    }
    else {
        $('#signup_alias').css('background-color', 'white');
        $('#signup_alias_ok').val(0);
        $('#alias_validation').text('Nimimerkin tulisi olla 3-20 merkkiä pitkä');
        validateAllSignUpFileds();
    }
});

$(document).on('blur', '#signup_email', function() {
    let email = $("#signup_email").val();

    if(isEmail(email)){
        $('#signup_email').css('background-color', 'lightgreen');
        $('#signup_email_ok').val(1);
        validateAllSignUpFileds();
    }
    else{
        $('#signup_email').css('background-color', 'red');
        $('#signup_email_ok').val(0);
        validateAllSignUpFileds();
    }
});

// function to validate email
function isEmail(emailAddress) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(emailAddress);
};

$(document).on('blur', '#signup_password1', function() {
    let password1 = $('#signup_password1').val();
    let password2 = $('#signup_password2').val();

    if(password1.length > 7){
        $('#signup_password_ok').val(1);
        $('#signup_password1').css('background-color', 'lightgreen');
        validateAllSignUpFileds();
    }
    else{
        $('#signup_password1').css('background-color', 'red');
        $('#signup_password_ok').val(0);
        validateAllSignUpFileds();
    }

    if(password1.length > 7 && password1 == password2){
        $('#signup_password_ok').val(1);
        $('#signup_password1').css('background-color', 'lightgreen');
        $('#signup_password2').css('background-color', 'lightgreen');
        validateAllSignUpFileds();
    }
    else{
        $('#signup_password2').css('background-color', 'red');
        $('#signup_password_ok').val(0);
        validateAllSignUpFileds();
    }
});

// password2
$(document).on('input', '#signup_password2', function() {
    let password1 = $('#signup_password1').val();
    let password2 = $('#signup_password2').val();

    if(password1.length > 7 && password1 == password2){
        $('#signup_password_ok').val(1);
        $('#signup_password1').css('background-color', 'lightgreen');
        $('#signup_password2').css('background-color', 'lightgreen');
        validateAllSignUpFileds();
    }
    else{
        $('#signup_password2').css('background-color', 'red');
        $('#signup_password_ok').val(0);
        validateAllSignUpFileds();
    }

});


function validateAllSignUpFileds(){
    // Function not in use in this assigment, so validation can be done in backend by express-validator
    // So registration button is enabled, even when there are incorrect inputs in registration form.
    // remove 1's and comment // to enable front-end validation.
    let aliasOk = 1; // $('#signup_alias_ok').val();
    let emailOk = 1; // $('#signup_email_ok').val();
    let passwordOk = 1; // $('#signup_password_ok').val();
    if(aliasOk == 1 && emailOk == 1 && passwordOk == 1){
        $('#submit-registration-button').prop('disabled', false);
    }
    else{
        $('#submit-registration-button').prop('disabled', true);
    }
}

// profile.handlebars
// Upload profile picture
$(document).on('click','#selectPictureToUpload', function(){
    $('#uploadProfilePicture').trigger('click');
    $(document).on('change', '#uploadProfilePicture', function(){
        $('#uploadProfilePictureForm').submit();
    });
});

//Show Tallenna muutokset
$(document).on('change', '#profile-details', function() {
    $('#update-button').slideDown(500);
})

// Validate update alias
$(document).on('input', '#update-alias', function() {
    let alias = $('#update-alias').val();
    let id = $('#update-id').val()
    if (alias.length > 2 && alias.length < 21){
        $.ajax({
            url: '/user/get_if_alias/'+alias,
            type: "GET",
            data: {
                alias: alias
            },
            success: function(data){
                if((data.found) && (data.id != id)){
                    $('#update-alias').css('background-color', 'red');
                    $('#update-alias-ok').val(0);
                    $('#update-alias-info').text('Nimimerkki on jo varattu');
                    validateAllUpdateFileds();
                }
                else{
                    $('#update-alias').css('background-color', 'lightgreen');
                    $('#update-alias-ok').val(1);
                    $('#update-alias-info').text('nimerkki on vapaa');
                    validateAllUpdateFileds();
                }
            }
        });
    }
    else if(alias.length > 20) {
        $('#update-alias').css('background-color', 'red');
        $('#update-alias-ok').val(0);
        $('#update-alias-info').text('Nimimerkin tulisi olla enintään 20 merkkiä pitkä');
        validateUpdateFileds();
    }
    else {
        $('#update-alias').css('background-color', 'white');
        $('#update-alias-ok').val(0);
        $('#update-alias-info').text('Nimimerkin tulisi olla 3-20 merkkiä pitkä');
        validateAllUpdateFileds();
    }
});

// Validate update email
$(document).on('blur', '#update-email', function() {
    let email = $("#update-email").val();

    if(isEmail(email)){
        $('#update-email').css('background-color', 'lightgreen');
        $('#update-email-ok').val(1);
        validateAllUpdateFileds();
    }
    else{
        $('#update-email').css('background-color', 'red');
        $('#update-email-ok').val(0);
        $('#update-email-info').text('Syötä toimiva sähköpostiosoite');
        validateAllUpdateFileds();
    }
});

function validateAllUpdateFileds(){
    let aliasOk = $('#update-alias-ok').val();
    let emailOk = $('#update-email-ok').val();
    if(aliasOk != 1 || emailOk != 1){
        $('#update-button').hide();
    }
}

// Confirm delete profile
$(document).on('click', '#delete_btn', function() {
    $('#delete_btn').hide(500);
    $('#confirm_delete').slideDown(500);
});

$(document).on('click', '#cancel_delete', function() {
    $('#confirm_delete').hide(500);
    $('#delete_btn').slideDown(500);
});
