function drop(event) {
    debugger
    event.preventDefault();
    var currentItem = event.dataTransfer.getData('text');
    var item = document.getElementById(currentItem);

    //prevent exisiting item drag drop issue.
    var target = event.target.querySelectorAll('#' + currentItem)
    if (target.length > 0) {
        item.style.backgroundColor = 'black';
        return;
    }

    document.cookie = 'leftOrRight=' + event.target.className;
    var exisitingItem = getCookie('itemId');
    if (!isNullOrUndefindedOrEmpty(exisitingItem)) {
        document.cookie = 'itemId=' + exisitingItem + ',' + currentItem;
    } else {
        document.cookie = 'itemId=' + currentItem;
    }
    item.style.backgroundColor = 'black';
    var target = event.target;
    target.appendChild(item);
}

function dragover(event) {
    event.preventDefault();
}

function onDrag(event) {
    event.dataTransfer.setData('text', event.target.id);
    event.target.style.backgroundColor = 'yellow';
}


function getComponent(id, text) {
    var element = document.createElement('div');
    element.id = id;
    element.innerHTML = text;
    element.className = 'drag';
    element.draggable = true;
    element.ondragstart = onDrag;
    return element;
}


// reload state maintain process
var leftContainer = document.getElementById('left');
var rightContainer = document.getElementById('right');

var cookies = getCookie('leftOrRight');

for (i = 0; i < 3; i++) {
    var commonClass = 'box';
    var itemIds = getCookie('itemId');
    if (!isNullOrUndefindedOrEmpty(itemIds)) {
        var itemIdsArr = itemIds.split(',');
        if (itemIdsArr.includes(commonClass + i)) {
            if (isRightContainer(cookies)) {
                rightContainer.appendChild(getComponent(commonClass + i, 'Box ' + i));
            }
        } else {
            leftContainer.appendChild(getComponent(commonClass + i, 'Box ' + i));
        }
    } else {
        leftContainer.appendChild(getComponent(commonClass + i, 'Box ' + i));
    }

}

// ______________________________________________________________________
// add ondragstart event for all the elements using foreach
document.querySelectorAll('.drag').forEach(function (item) {
    item.ondragstart = onDrag;
});

document.querySelectorAll('.left').forEach(function (item) {
    item.ondragover = dragover;
    item.ondrop = drop;
});

document.querySelectorAll('.right').forEach(function (item) {
    item.ondragover = dragover;
    item.ondrop = drop;
});

function isRightContainer() {
    return cookies === 'right';
}


function isNullOrUndefindedOrEmpty(value) {
    return value === null || value === undefined || value === '';
}







// utility
function getCookie(name) {
    // Create a regular expression to find the cookie by name
    let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
        // Return the value of the cookie
        return match[2];
    } else {
        // Return null if the cookie is not found
        return null;
    }
}