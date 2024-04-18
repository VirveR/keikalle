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
    let aliasOk = $('#signup_alias_ok').val();
    let emailOk = $('#signup_email_ok').val();
    let passwordOk = $('#signup_password_ok').val();
    if(aliasOk == 1 && emailOk == 1 && passwordOk == 1){
        $('#submit-registration-button').prop('disabled', false);
    }
    else{
        $('#submit-registration-button').prop('disabled', true);
    }
}