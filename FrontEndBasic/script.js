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

// GET IMAGE Functionality
document.addEventListener("DOMContentLoaded", function() {
    // Assuming your "Get Image" button has an id of "getImageButton"
    document.getElementById("getImageButton").addEventListener("click", function(event) {
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

                // Append the new results
                data.forEach(item => {
                    let resultDiv = document.createElement("div");
                    resultDiv.textContent = JSON.stringify(item);
                    document.getElementById("resultsContainer").appendChild(resultDiv);
                });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
});
