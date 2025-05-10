//// Initialisiert DOM-Elemente und registriert Event-Listener
const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const tableBody = document.querySelector("#todos-body");
const table = document.querySelector(".table-responsive")
const controlButton = document.querySelector("#control-buttons");
//Haupt-Event-Registrierung
eventListeners();
function eventListeners()
{
    document.addEventListener("DOMContentLoaded", onPageLoad());
    form.addEventListener("submit", HandleFormSubmit);
    table.addEventListener("click",deleteTodo);
    table.addEventListener("click", CompletedTodo);
    controlButton.addEventListener("click",HandleButton)
}
//Lädt gespeicherte Todos beim Laden der Seite
function onPageLoad()
{
    LoadAllTodosFromLocalStorage();
   
}
//Reagiert auf Klicks bei "Alle anzeigen" und "Alle löschen"
function HandleButton(e)
{
    if(e.target.id === "show-all")
    {
        LoadAllTodosFromLocalStorage();
        document.getElementById("show-all").setAttribute("style", "display: none");
    }
    if(e.target.id === "clear-all")
    {
        let todos = getTodosFromStorage();
        localStorage.removeItem("todos");
        tableBody.innerHTML = "";
        showMessage("success", "Alle Aufgaben wurden gelöscht!");
    }
}
// Markiert eine Aufgabe als erledigt in der UI und im Speicher

function CompletedTodo(e)
{
    if(e.target.classList.contains("btn-success"))
    {
       const completed = e.target.closest("tr");
       const todoCell = completed.querySelector("td:nth-child(2)");
       todoCell.style.textDecoration = "line-through";
       const statusCell = completed.querySelector("td:nth-child(3)"); 
       statusCell.textContent = "Erledigt";
       CompletedTodoFromStorage(completed);
       showMessage("success","Die Aufgabe ist erfolgreich erledigt!");
    }
}
// Aktualisiert den Speicher nach Markierung als erledigt
function CompletedTodoFromStorage(completed)
{
    let todos = getTodosFromStorage();
    const id = Number(completed.getAttribute("todo-id"));
    const targetTodo = todos.find(todo => todo.id == id);
    if(targetTodo)
        targetTodo.status = false;
    localStorage.setItem("todos", JSON.stringify(todos));
    updateTodoIds();
    updateUIFromStorage();
}
// Löscht eine Aufgabe aus der UI und aus dem Speicher
function deleteTodo(e)
{
    if(e.target.classList.contains("btn-danger"))
    {
        e.target.closest("tr").remove();
        deleteTodoFromStorage(e.target.closest("tr").getAttribute("todo-id"));
        showMessage("success","Die Aufgabe ist erfolgreich gelöscht!");
    }
}
// Lädt alle gespeicherten Todos und blendet "Alle löschen" 
function LoadAllTodosFromLocalStorage()
{  
    
    let todos = getTodosFromStorage();
    if(todos.length === 0)
        document.getElementById("clear-all").setAttribute("style", "display: none")
    todos.forEach(function(todo)
    {
        addTodoUI(todo);
    });
}
// Entfernt ein Todo aus dem Speicher und aktualisiert die Oberfläche
function deleteTodoFromStorage(id)
{
    let todos = getTodosFromStorage();
    let updatesTodos = todos.filter(todo => todo.id !== Number(id));
    localStorage.setItem("todos", JSON.stringify(updatesTodos));
    updateTodoIds();
    updateUIFromStorage();
}
// Behandelt die Formular-Aktion für "Speichern" oder "Finden"
function HandleFormSubmit(e)
{
     e.preventDefault();
    const newTodo = input.value.trim();
        if(newTodo === "")
            showMessage("danger", "Geben Sie bitte eine Aufagabe ein!");
        else
        {
            const clickedButton = e.submitter;  
            if(clickedButton.classList.contains("btn-primary"))
            {
                addTodo(newTodo)
            }
            if(clickedButton.classList.contains("btn-warning"))
            {
                FindTodo(newTodo);
            }
        }
       
}
// Sucht nach einem bestimmten Todo anhand des eingegebenen Textes
function FindTodo(todo)
{
    let todos = getTodosFromStorage();
    const todoList = todos.filter(x=> x.todo.toLowerCase().includes(todo.toLowerCase()));
    if(todoList.length === 0)
        showMessage("warning", "Keine Aufgabe sind vorhanden");
    else
    {
        tableBody.innerHTML = "";
        todoList.forEach(function(todo){
            addTodoUI(todo);
        });
    }
    document.getElementById("show-all").setAttribute("style", "display: flex");
    document.getElementById("clear-all").setAttribute("style", "display: none");
}
// Erstellt und speichert ein neues Todo
function addTodo(newTodo)
{                   
    const todoObject = 
    {
        id: getTodosFromStorage().length + 1,
        todo : newTodo,
        status: true
    }

    addTodoUI(todoObject);
    addTodoToStorage(todoObject);
    showMessage("success","Aufgabe ist erfolgreich gespeichert!");                                                       
}
// Fügt das Todo in localStorage hinzu
function addTodoToStorage(todo)
{
    let todos = getTodosFromStorage();
    todos.push(todo);
    localStorage.setItem("todos",JSON.stringify(todos));
}
// Fügt ein neues Todo zur Benutzeroberfläche hinzu
function addTodoUI(newTodo)
{
    const tr = document.createElement("tr");
    tr.setAttribute("todo-id", newTodo.id);
    const nummer = document.createElement("td");
    nummer.setAttribute("scope","row");
   
    nummer.appendChild(document.createTextNode(newTodo.id));

    const todoItem = document.createElement("td");
    todoItem.style.textDecoration = newTodo.status ? "none" :"line-through";
    const status = document.createElement("td");
    status.appendChild(document.createTextNode(newTodo.status ? "In Bearbeitung" : "Erledigt"));

    const action = document.createElement("td");
    const buttonWrapper = document.createElement("div");
    buttonWrapper.className = "d-flex justify-content-center gap-2";
    const del = document.createElement("button");
    del.setAttribute("type","button");
    del.className = "btn btn-danger";
    del.innerHTML = "<i class='bi bi-trash'></i>";
    del.appendChild(document.createTextNode("Löschen"));
    const finish = document.createElement("button");
    finish.setAttribute("type","submit");
    finish.className = "btn btn-success";
    finish.innerHTML = "<i class='bi bi-check2-circle'></i>";
    finish.appendChild(document.createTextNode("Erledigt"));
    
    buttonWrapper.appendChild(del);
    buttonWrapper.appendChild(finish);
    action.appendChild(buttonWrapper);
    todoItem.appendChild(document.createTextNode(newTodo.todo));
    tr.appendChild(nummer);
    tr.appendChild(todoItem);
    tr.appendChild(status);
    tr.appendChild(action);
    tableBody.appendChild(tr);

    input.value = "";
}

// Holt die Todos aus dem localStorage
function getTodosFromStorage()
{
    return JSON.parse(localStorage.getItem("todos")) || []
}
// Zeigt eine Bootstrap-Meldung unter dem Formular an
function showMessage(type, message)
{
    const alertItem = document.createElement("div");
    alertItem.className = `alert alert-${type} fade show`; 
    alertItem.textContent = message;
    alertItem.setAttribute("role","alert");
    form.insertAdjacentElement("afterend", alertItem);
    setTimeout(() =>{
        alertItem.remove()
    }, 1500);
}
// Aktualisiert alle Todo-IDs nach Löschungen
function updateTodoIds()
{
    let todos = getTodosFromStorage();
    const updatedTodos = todos.map((todo,index) =>({
        ...todo, //spread syntax const todo = { id: 3, text: "Aufräumen", status: true };
        id: index+1
    }));
    localStorage.setItem("todos", JSON.stringify(updatedTodos));
}
// Zeichnet die UI mit dem aktuellen Speicherstand neu
function updateUIFromStorage() {
  tableBody.innerHTML = ""; 
  const todos = getTodosFromStorage(); 
  todos.forEach(todo => {
    addTodoUI(todo); 
  });
}
