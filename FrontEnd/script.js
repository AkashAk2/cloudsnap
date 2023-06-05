let totalTags = {};
function addFormTags(id){
    if(!(id in totalTags)){
        totalTags[id] = 0;
    }
    totalTags[id] += 1;
    let formGroupDiv = document.createElement("div");
    formGroupDiv.innerHTML = `<label for="">Tag ${totalTags[id]}</label>
        <div class="tag-group">
        <input
            class="form-control tag-name"
            type="text"
            placeholder="Enter tag name"
            name="tag${totalTags[id]}"
        />
        <input
            class="form-control tag-value"
            type="text"
            placeholder="Tag value or count"
            name="tag${totalTags[id]}count"
      />`;
 
    const element = document.getElementById(id);
    element.appendChild(formGroupDiv);
}
 
// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // your region
// AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//     IdentityPoolId: 'IDENTITY_POOL_ID', // your identity pool id
// });
 
// Cognito User Pool Id
const userPoolId = 'us-east-1_RwtDTN0q2'; // your user pool id
 
// Cognito User Pool App Client Id
const userPoolClientId = '2g9q5dt085ukb3pqacjsrp5tb2'; // your user pool client id
 
const poolData = {
    UserPoolId: userPoolId,
    ClientId: userPoolClientId
};
 
// Create a new CognitoUserPool
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
 
// Login function
function onLoginClick(){
    let username = document.getElementById('emailid').value;
    let password = document.getElementById('password').value;
 
    const authData = {
        Username: username,
        Password: password
    };
 
    const authDetails = new AmazonCognitoIdentity.AuthenticationDetails(authData);
 
    const userData = {
        Username: username,
        Pool: userPool
    };
 
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
 
    cognitoUser.authenticateUser(authDetails, {
        onSuccess: function (result) {
            console.log('Access Token: ' + result.getAccessToken().getJwtToken());
            window.location.href= "./index.html";
        },
        onFailure: function(err) {
            alert(err.message || JSON.stringify(err));
        }
    });
}
 
// Signup function
function redirectToIndex() {
    let firstName = document.getElementById('firstName').value;
    let lastName = document.getElementById('lastName').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
 
    let attributeList = [];
 
    let dataEmail = {
        Name: 'email',
        Value: email
    };
 
    let dataFirstName = {
        Name: 'given_name',
        Value: firstName
    };
 
    let dataLastName = {
        Name: 'family_name',
        Value: lastName
    };
 
    let attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    let attributeFirstName = new AmazonCognitoIdentity.CognitoUserAttribute(dataFirstName);
    let attributeLastName = new AmazonCognitoIdentity.CognitoUserAttribute(dataLastName);
 
    attributeList.push(attributeEmail);
    attributeList.push(attributeFirstName);
    attributeList.push(attributeLastName);
 
    userPool.signUp(email, password, attributeList, null, function(err, result){
        if (err) {
            alert(err.message || JSON.stringify(err));
            return;
        }
        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
        window.location.href = "index.html";
    });
}
 
// Logout function
function onLogOut(){
    if (userPool.getCurrentUser() != null) {
        userPool.getCurrentUser().signOut();
    }
    window.location.href= "./login.html";
}

function redirectToLogin(){
    window.location.href= "./login.html";
}