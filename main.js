var inputField = document.getElementById("inputText");
var btnAdd = document.getElementById("btnAdd");
var btnRemove = document.getElementById("remove");
var todoDiv = document.getElementById("todoDiv");





btnAdd.addEventListener("click", function () {
    //ListenPunkt erstellen

    var list = document.createElement("li");
    list.innerHTML = inputField.value;
    list.classList.add("list")
    todoDiv.appendChild(list);
    inputField.value = "";



    //Checkbox erstellen
    var check = document.createElement("input");
    check.type = "checkbox";
    list.appendChild(check);

    //Durchsteichen
    list.addEventListener("click", function () {
        list.style.textDecoration = "line-through"
    })
    
    //löschen von mehreren Eingaben
    btnRemove.addEventListener("click", function () {
    //var defaultCheck = check.defaultChecked;
        var trueCheck = check.checked;

        if (trueCheck == true) {
            
            todoDiv.removeChild(list);

        }
    })
});



