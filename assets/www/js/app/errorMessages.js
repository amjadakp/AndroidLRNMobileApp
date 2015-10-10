var empty  = "Enter Username and Password";
var CEA007 = "Invalid credentials";
var CEA008 = "Invalid password attempt for more than specified number of times";
var CEA009 = "Incorrect username";
var CEA010 = "Invalid email";
var CEA015 = "unable to send mail";
var CEA017 = "email not set for the user to send a mail";
var CEA011 = "Password key from email expired";
var CEA014 = "Old password entered is not correct";
var forgotemail = "Email has been sent successfully";
var emailEmpty = "Enter EmailId";
var resetpassword = "Password has beeb reseted successfully";
var changepassword = "Password has been changed successfully";
var passwordEmpty  = "Password columns should not be empty";
function Errorcode(code)
{
	this.errorCode=code;
	this.errorMessage="";
}
Errorcode.prototype.getMessage= function(){
	switch(this.errorCode)
	{
		case '-1':
			this.errorMessage = "SiteId doesn't Exists";
			console.log("this.errorMessage"+this.errorMessage);
			break;
	}
	return this.errorMessage;
}