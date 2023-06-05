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