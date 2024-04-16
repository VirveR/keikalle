function toggleSignInForm() {
    $('#loginForm').slideDown(500);
    $("#openLoginFormButton").hide(500);
}


function toggleSignUpForm() {
    $('#signupForm').slideDown(500);
    $('#loginForm').hide(500);
}

//Checking if alias is reserved in database
$(document).on('input', '#signup_alias', function() {
    let alias = $('#signup_alias').val();
    if (alias.length > 2){
        $.ajax({
            url: '/user/get_if_alias/'+alias,
            type: "GET",
            data: {
                alias: alias
            },
            success: function(data){
                if(data.found){
                    $('#signup_alias').css('background-color', 'red');
                    $('#submit-registration-button').prop('disabled', true);
                }
                else{
                    $('#signup_alias').css('background-color', 'lightgreen');
                    $('#submit-registration-button').prop('disabled', false);
                }
            }
        });
    }
    else {
        $('#signup_alias').css('background-color', 'white');
    }
})