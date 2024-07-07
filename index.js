window.addEventListener('load', onLoad);

let designerData = [];
let APIHost = 'http://localhost:5125';


async function drop(event) {
    event.preventDefault();
    var currentItem = event.dataTransfer.getData('text');
    var item = document.getElementById(currentItem);

    // Prevent existing item drag drop issue.
    var target = event.target.querySelectorAll('#' + currentItem);
    if (target.length > 0) {
        item.style.backgroundColor = 'black';
        return;
    }

    await updateDesign(item, event);

    item.style.backgroundColor = 'black';
    target = event.target;
    target.appendChild(item);
}

function dragover(event) {
    event.preventDefault();
}

function onDrag(event) {
    event.dataTransfer.setData('text', event.target.id);
    event.target.style.backgroundColor = 'yellow';
}

function getRectComponent(id, text, className) {
    var element = document.createElement('div');
    element.id = id;
    element.innerHTML = text;
    element.className = className;
    element.draggable = true;
    element.setAttribute('data-name', 'rectangle');
    element.ondragstart = onDrag;
    return element;
}

function getCircleComponent(id, text, className) {
    var element = document.createElement('div');
    element.id = id;
    element.innerHTML = text;
    element.className = className;
    element.draggable = true;
    element.setAttribute('data-name', 'circle');
    element.ondragstart = onDrag;
    return element;
}

async function onLoad() {
    // Create default widget panel items:
    var widgetContainer = document.getElementById('widget-container');
    var rect = getRectComponent(uuidv4(), 'Rectangle', 'widget');
    var circle = getCircleComponent(uuidv4(), 'Circle', 'widget');
    widgetContainer.appendChild(rect);
    widgetContainer.appendChild(circle);

    // Reload state maintain process
    try {
        const response = await fetch(APIHost + '/getdata');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        renderWidget(data);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Add ondragstart event for all the elements using forEach
document.querySelectorAll('.widget').forEach(function (item) {
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

function isNullOrUndefinedOrEmpty(value) {
    return value === null || value === undefined || value === '';
}

function renderWidget(data) {
    var leftContainer = document.getElementById('left');
    var rightContainer = document.getElementById('right');

    data.forEach(function (item, index) {
        let currentWidget = '';
        if (item.item === 'rectangle') {
            currentWidget = getRectComponent(item.id, item.name, 'widget' + index);
        } else if (item.item === 'circle') {
            currentWidget = getCircleComponent(item.id, item.name, 'widget' + index);
        }
        if (item.position === 'right') {
            rightContainer.appendChild(currentWidget);
        } else {
            leftContainer.appendChild(currentWidget);
        }
    });
}

// Serialize the component position data
async function updateDesign(item, event) {
    var widgetName = item.getAttribute('data-name');
    var widgetId = item.id;
    var widgetText = item.innerHTML;
    var widgetPosition = event.target.className;
    var widgetData = {
        item: widgetName,
        id: widgetId,
        name: widgetText,
        position: widgetPosition
    };

    await checkAndUpdateDesignerData();
    checkAndUpdateDataForPost(widgetData, designerData);

    try {
        const response = await fetch(APIHost + '/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(designerData)
        });
        const data = await response.json();
        if (data === true) {
            console.log('Data updated successfully');
            designerData = [];
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Utility

// Generate Random Guid
function uuidv4() {
    return 'widget-xxxx-xxxx-4xxx-yxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Check and update the data
function checkAndUpdateDataForPost(widgetData, designerData) {
    var isExist = false;
    designerData.forEach(function (item) {
        if (item.id === widgetData.id) {
            item.position = widgetData.position;
            isExist = true;
        }
    });

    if (!isExist) {
        designerData.push(widgetData);
    }
}

async function checkAndUpdateDesignerData() {
    if (designerData.length === 0) {
        try {
            const response = await fetch(APIHost + '/getdata');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            designerData = await response.json();
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }
}
