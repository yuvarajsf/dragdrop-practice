window.addEventListener('load', onLoad);

let designerData = [];
let APIHost = 'http://localhost:5125';
let rectName = 'rectangle';
let circleName = 'circle';

let offsetX, offsetY;
let positionX, positionY;

async function drop(event) {
    debugger;
    event.preventDefault();
    var currentItem = event.dataTransfer.getData('id');
    var dataId = event.dataTransfer.getData('data-id');
    var item = document.getElementById(currentItem);

    const x = event.clientX - offsetX;
    const y = event.clientY - offsetY;


    // Prevent existing item drag drop issue.
    var target = event.target.querySelectorAll('#' + currentItem);
    target.forEach(function (element) {
        if (element.getAttribute('data-id') === dataId) {
            return;
        }
    });

    target = event.target;
    positionX =  x - target.getBoundingClientRect().left + 'px';
    positionY =  y - target.getBoundingClientRect().top + 'px';
    item.style.left = positionX;
    item.style.top = positionY;
    await updateDesign(item, event);
    target.appendChild(item);
}

function dragover(event) {
    event.preventDefault();
}

function onDrag(event) {
    var rect = this.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    event.dataTransfer.setData('id', event.target.id);
    event.dataTransfer.setData('data-id', event.target.getAttribute('data-id'));
}

function getWidgetContainer() {
    var element = document.createElement('div');
    element.id = 'widget-wrapper';
    element.className = 'widget-wrapper';
    return element;
}

function getRectComponent(id, text, className, dataName) {
    var element = document.createElement('div');
    element.id = id;
    element.innerHTML = text;
    element.className = className;
    element.draggable = true;
    element.setAttribute('data-id', dataName);
    element.ondragstart = onDrag;
    return element;
}

function getCircleComponent(id, text, className, dataName) {
    var element = document.createElement('div');
    element.id = id;
    element.innerHTML = text;
    element.className = className;
    element.draggable = true;
    element.setAttribute('data-id', dataName);
    element.ondragstart = onDrag;
    return element;
}

async function onLoad() {
    // Create default widget panel items:
    var widgetContainer = document.getElementsByClassName('widget-container')[0];
    var rect = getRectComponent(rectName, rectName, 'widget', uuidv4());
    var circle = getCircleComponent(circleName, circleName, 'widget', uuidv4());
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

document.querySelectorAll('.canvas').forEach(function (item) {
    item.ondragover = dragover;
    item.ondrop = drop;
});

function isNullOrUndefinedOrEmpty(value) {
    return value === null || value === undefined || value === '';
}

function renderWidget(data) {
    var designCanvas = document.getElementById('design-canvas');

    data.forEach(function (item) {
        let currentWidget = '';
        if (item.item === 'rectangle') {
            currentWidget = getRectComponent(item.name, item.name, 'widget', item.uniqueId);
        } else if (item.item === 'circle') {
            currentWidget = getCircleComponent(item.name, item.name, 'widget', item.uniqueId);
        }
        if (currentWidget !== '') {
            debugger;
            currentWidget.style.left = item.position.x;
            currentWidget.style.top = item.position.y;
            designCanvas.appendChild(currentWidget);
        }
    });
}

// Serialize the component position data
async function updateDesign(item, event) {
    var widgetUniqId = item.getAttribute('data-id');
    var widgetName = item.id;
    var widgetText = item.innerHTML;
    var widgetPosition = {
        x: positionX,
        y: positionY
    };

    var widgetData = {
        item: widgetName,
        uniqueId: widgetUniqId,
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
        if (item.uniqueId === widgetData.uniqueId) {
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
