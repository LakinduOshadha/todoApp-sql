// @author Lakindu Oshadha (lakinduoshadha98@gmail.com)

// Item template
function itemTemplate(x) {
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
            <span class="item-text">${x.item}</span>
            <div>
              <button data-id = ${x.id} class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
              <button data-id = ${x.id} class="delete-me btn btn-danger btn-sm">Delete</button>
            </div>
          </li>`
}
let createField = document.getElementById("create-field")
// Create function
document.getElementById("create-form").addEventListener("submit", function(e) {
    e.preventDefault()
    axios.post('/create-item', {text: createField.value}).then(function(res) {   
        document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(res.data))
        createField.value = ""
        createField.focus()

    }).catch(function() {
        console.log("please try again later")
})  
})

// Browser side rendering
let htmlString = items.map(function (x){
    return itemTemplate(x)
}).join('')
document.getElementById("item-list").insertAdjacentHTML("beforeend", htmlString)

document.addEventListener("click", function(e) {
    // Delete function
    if(e.target.classList.contains("delete-me")) {
        if(confirm("Are you sure to delete the item permenetly?")) {
            axios.post('/delete-item', {id: e.target.getAttribute("data-id")}).then(function() {   
                e.target.parentElement.parentElement.remove()
            }).catch(function() {
                console.log("please try again later")
            } )
        }
    }

    // Update function
    if(e.target.classList.contains("edit-me")) {
        let userInput = prompt("Enter the value", e.target.parentElement.parentElement.querySelector(".item-text").innerHTML)

        if(userInput) {
            axios.post('/update-item', {text: userInput, id: e.target.getAttribute("data-id")}).then(function() {   
                e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput
            }).catch(function() {
                console.log("please try again later")
            } )
        }   
    }
})