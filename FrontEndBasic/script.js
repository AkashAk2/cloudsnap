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

//UPLOAD IMAGE function
function uploadImage(event) {
  event.preventDefault();
  
  var fileInput = document.querySelector('#imageFile');
  var fileName = fileInput.value.split('\\').pop();
  
  var reader = new FileReader();
  reader.onload = function() {
    var fileData = reader.result.replace(/^data:.+;base64,/, '');
    
    fetch('https://6irmyz4kvg.execute-api.us-east-1.amazonaws.com/prod/upload', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: fileName,
        image: fileData
      })
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById("ex1-tab-6").click();
      document.getElementById("resultsContainer").innerHTML = '';

      let resultDiv = document.createElement("div");
      resultDiv.textContent = JSON.stringify(data);
      document.getElementById("resultsContainer").appendChild(resultDiv);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };
  
  reader.readAsDataURL(fileInput.files[0]);
}

 
// GET IMAGE Functionality
function getImageTags(event){
    event.preventDefault();  // prevent the default form submission
 
    let formData = new URLSearchParams();
 
    // Assuming your form has an id of "get-image-form"
    let form = document.getElementById("get-image-form");
 
    // Gather the form data
    for(let i = 1; i <= totalTags["getImageByTags"]; i++) {
        let tagName = form.querySelector(`input[name="tag${i}"]`).value;
        let tagCount = form.querySelector(`input[name="tag${i}count"]`).value;
 
        if(tagName && tagCount) {
            formData.append(`tag${i}`, tagName);
            formData.append(`tag${i}count`, tagCount);
        }
    }
 
    // Create the full URL
    let url = 'https://6irmyz4kvg.execute-api.us-east-1.amazonaws.com/prod/search?' + formData.toString();
 
    fetch(url, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            // Switch to the "Results" tab
            document.getElementById("ex1-tab-6").click();
 
            // Clear the previous results
            document.getElementById("resultsContainer").innerHTML = '';

            const dataArray = Array.isArray(data) ? data : [data];
 
            // Append the new results
            dataArray.forEach(item => {
                let resultDiv = document.createElement("div");
                resultDiv.textContent = JSON.stringify(item);
                document.getElementById("resultsContainer").appendChild(resultDiv);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
 
// UPDATE IMAGE TAGS Functionality
function updateImageTags(event) {
    event.preventDefault();
 
    let formData = new URLSearchParams();
 
    let form = document.getElementById("update-image-form");
    let url = form.querySelector('input[name="url"]').value;
    let type = form.querySelector('input[name="type"]').value;
 
    if(url) {
        formData.append("url", url);
    }
    if(type) {
        formData.append("type", type);
    }
 
    for(let i = 1; i <= totalTags["updateImageByTags"]; i++) {
        let tagName = form.querySelector(`input[name="tag${i}"]`).value;
        let tagCount = form.querySelector(`input[name="tag${i}count"]`).value;
 
        if(tagName && tagCount) {
            formData.append(`tag${i}`, tagName);
            formData.append(`tag${i}count`, tagCount);
        }
    }
 
    fetch('https://6irmyz4kvg.execute-api.us-east-1.amazonaws.com/prod/modifytags', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    }).then(response => response.json()).then(data => {
        // Switch to the "Results" tab
        document.getElementById("ex1-tab-6").click();
 
        // Clear the previous results
        document.getElementById("resultsContainer").innerHTML = '';
 
        // Append the new results
        let resultDiv = document.createElement("div");
        resultDiv.textContent = JSON.stringify(data);
        document.getElementById("resultsContainer").appendChild(resultDiv);
    }).catch((error) => {
            console.error('Error:', error);
    });
}

//FIND QUERY WITH IMAGE
function findImage(event) {
    event.preventDefault();
 
    let form = document.getElementById("find-image-form");
    let fileInput = form.querySelector('input[name="findImageFile"]');
    let imageFile = fileInput.files[0];

    if (!imageFile) {
        console.error("No file selected");
        return;
    }

    if (imageFile.size > 10 * 1024 * 1024) { // File size in bytes, 10 * 1024 * 1024 = 10MB
        alert("File is too large. Maximum size is 10MB.");
        return;
    }

    let reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = function () {
        let base64Image = reader.result.split(',')[1]; // Remove the "data:image/*;base64," part
        fetch('https://6irmyz4kvg.execute-api.us-east-1.amazonaws.com/prod/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({imageFile: base64Image})
        })
        .then(response => response.json())
        .then(data => {
            if(Array.isArray(data)) {
                // Switch to the "Results" tab
                document.getElementById("ex1-tab-6").click();

                // Clear the previous results
                document.getElementById("resultsContainer").innerHTML = '';

                // Create an ordered list
                let orderedList = document.createElement("ol");

                // Iterate through the results array
                data.forEach(function(result, index) {
                    // Create a list item for each result
                    let listItem = document.createElement("li");
                    listItem.textContent = result;
                    // Append the list item to the ordered list
                    orderedList.appendChild(listItem);
                });

                // Append the ordered list to the results container
                document.getElementById("resultsContainer").appendChild(orderedList);
            } else {
                //Append the ordered list to the results container
                console.error('Error:', data)
            }
            })
        .catch((error) => {
            console.error('Error:', error);
        });
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
    };
}

// DELETE IMAGE Functionality
function deleteImage(event) {
    event.preventDefault();

    let imageUrl = document.getElementById("imageUrl").value; // assuming the Image Url is an input element with id 'imageUrl'
    if (imageUrl) {
        fetch(`https://6irmyz4kvg.execute-api.us-east-1.amazonaws.com/prod/delete?image_url=${imageUrl}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            // Switch to the "Results" tab
            document.getElementById("ex1-tab-6").click();
     
            // Clear the previous results
            document.getElementById("resultsContainer").innerHTML = '';
     
            // Append the new results
            let resultDiv = document.createElement("div");
            resultDiv.textContent = JSON.stringify(data);
            document.getElementById("resultsContainer").appendChild(resultDiv);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else {
        console.log('Image Url is missing.');
    }
}
 
//MAIN function calls
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('uploadImageButton').addEventListener('click', uploadImage);
    document.getElementById("getImageButton").addEventListener("click", getImageTags);
    document.getElementById("updateButton").addEventListener("click", updateImageTags);
    document.getElementById("findImageButton").addEventListener("click", findImage);
    document.getElementById("deleteImageButton").addEventListener("click", deleteImage);
});

function onLogOut() {
    var poolData = {
        UserPoolId: 'us-east-1_M8wfM1a25',
        ClientId: '4pkqgeeo8a023t05qd5ln9drao'
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    var cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
        cognitoUser.signOut();
    }

    // Logout URL
    var logoutUrl = 'https://cloudsnap27.auth.us-east-1.amazoncognito.com/logout?client_id=4pkqgeeo8a023t05qd5ln9drao&logout_uri=https://cloudsnap27.auth.us-east-1.amazoncognito.com/login?client_id=4pkqgeeo8a023t05qd5ln9drao&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fcloudsnapweb.s3.amazonaws.com%2Findex.html';

    // Redirect to the logout URL
    window.location.href = logoutUrl;
}