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
    $('.error-box').hide(500);
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

// event search event cards registration to event button function
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

// event search event cards unregister from event button function
$(document).on('click', '.unRegisterFromEvent', function() {
    const eventId = this.id.split("_")[1];
    $.ajax({
        url: '/unRegisterFromEvent',
        type: 'POST',
        data: {eventId: eventId},
        success: function(data){
            if(data.removed){
                location.reload();
                console.log("unregistered from event");
            }
            else{
                console.log("unregistration failed");
            }
        }
    });
});

// Show all events
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
                    $('#alias_validation').text('Nimimerkki on vapaa');
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

// Able Tallenna muutokset and Peruuta buttons
$(document).on('focus', '#profile-details', function() {
    $('#update-button').prop("disabled", false);
    $('#cancel-update').prop("disabled", false);
});

// Confirm delete profile
$(document).on('click', '#delete-profile-btn', function() {
    $('#delete-profile-btn').hide(500);
    $('#confirm-delete-container').slideDown(500);
});
