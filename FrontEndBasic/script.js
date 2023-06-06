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
    
    fetch('https://hjowwmchpl.execute-api.us-east-1.amazonaws.com/test/upload', {
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
    let url = 'https://6irmyz4kvg.execute-api.us-east-1.amazonaws.com/test/search?' + formData.toString();
 
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
 
    fetch('https://6irmyz4kvg.execute-api.us-east-1.amazonaws.com/test/modifytags', {
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

//DELETE image
// DELETE IMAGE Functionality
function deleteImage(event) {
    event.preventDefault();

    let imageUrl = document.getElementById("imageUrl").value; // assuming the Image Url is an input element with id 'imageUrl'
    if (imageUrl) {
        fetch(`https://hjowwmchpl.execute-api.us-east-1.amazonaws.com/test/delete?image_url=${imageUrl}`, {
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
    document.getElementById("deleteImageButton").addEventListener("click", deleteImage);
});