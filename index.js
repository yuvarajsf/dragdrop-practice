function drop(event) {
    event.preventDefault();
    var currentItem = event.dataTransfer.getData('text');
    var item = document.getElementById(currentItem);
    debugger
    
    var target = event.target.querySelectorAll('#' + currentItem)
    if(target.length > 0){
        return;
    }
    

    item.style.backgroundColor = 'black';
    var target = event.target;
    target.appendChild(item);
}

function dragover(event) {
    event.preventDefault();
    //prevent exisiting item drag drop issue.
}

function onDrag(event) {
    event.dataTransfer.setData('text', event.target.id);
    event.target.style.backgroundColor = 'yellow';
}