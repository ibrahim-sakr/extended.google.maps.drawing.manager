var drawingManager;
var selectedShape;

// -----------------Add Custom Button (delete selected shape) ------------------------------------------------------- //
/**
 * The CenterControl adds a control to the map that recenters the map on
 * Chicago.
 * @constructor
 * @param {!Element} controlDiv
 * @param {!google.maps.Map} map
 * @param {?google.maps.LatLng} center
 */
function CenterControl(controlDiv, map, center) {
    // We set up a variable for this since we're adding event listeners later.
    var control = this;

    // Set the center property upon construction
    control.center_ = center;
    controlDiv.style.clear = 'both';

    // Set CSS for the control border
    var goCenterUI = document.createElement('div');
    goCenterUI.id = 'goCenterUI';
    goCenterUI.title = 'Click to delete selected Polygon';
    controlDiv.appendChild(goCenterUI);

    // Set CSS for the control interior
    var goCenterText = document.createElement('div');
    goCenterText.id = 'goCenterText';
    goCenterText.innerHTML = 'Delete Polygon';
    goCenterUI.appendChild(goCenterText);

    // Set up the click event listener for 'Center Map': Set the center of the map
    // to the current center of the control.
    goCenterUI.addEventListener('click', deleteSelectedShape);
}
// -----------------Add Custom Button (delete selected shape) ------------------------------------------------------- //


// -----------------Add Remove Node Button ------------------------------------------------------- //
function addDeleteButton(poly, imageUrl) {
    var path = poly.getPath();
    path["btnDeleteClickHandler"] = {};
    path["btnDeleteImageUrl"] = imageUrl;

    google.maps.event.addListener(poly.getPath(),'set_at',pointUpdated);
    google.maps.event.addListener(poly.getPath(),'insert_at',pointUpdated);
}

function pointUpdated(index) {
    var path = this;
    var btnDelete = getDeleteButton(path.btnDeleteImageUrl);

    if(btnDelete.length === 0) {
        var undoimg = $("img[src$='http://maps.gstatic.com/mapfiles/undo_poly.png']");

        undoimg.parent().css('height', '21px !important');
        undoimg.parent().parent().append('<div style="overflow-x: hidden; overflow-y: hidden; position: absolute; width: 30px; height: 27px;top:21px;"><img src="' + path.btnDeleteImageUrl + '" class="deletePoly" style="height:auto; width:auto; position: absolute; left:0;"/></div>');

        // now get that button back again!
        btnDelete = getDeleteButton(path.btnDeleteImageUrl);
        btnDelete.hover(function() {
            $(this).css('left', '-30px');
            return false;}
        , function() {
            $(this).css('left', '0px');
            return false;
        });
        btnDelete.mousedown(function() {
            $(this).css('left', '-60px');
            return false;
        });
    }

    // if we've already attached a handler, remove it
    if(path.btnDeleteClickHandler) btnDelete.unbind('click', path.btnDeleteClickHandler);

    // now add a handler for removing the passed in index
    path.btnDeleteClickHandler = function() {
        path.removeAt(index); 
        return false;
    };
    btnDelete.click(path.btnDeleteClickHandler);
}

function getDeleteButton(imageUrl) {
    return $("img[src$='" + imageUrl + "']");
}
// -----------------Add Remove Node Button ------------------------------------------------------- //


function clearSelection() {
    if (selectedShape) {
        selectedShape.setEditable(false);
        selectedShape = null;
    }
}

function setSelection(shape) {
    clearSelection();
    selectedShape = shape;
    shape.setEditable(true);
    for (var i = 0; i < shape.getPath().j.length; i++) {
        console.log(shape.getPath().j[i].lat()+" - "+shape.getPath().j[i].lng());
    }
}

function deleteSelectedShape() {
    if (selectedShape) {
        selectedShape.setMap(null);
    }
}

function initialize() {
    var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(22.344, 114.048),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        zoomControl: true
    };
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Create the DIV to hold the control and call the CenterControl() constructor
    // passing in this DIV.
    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map, mapOptions.center);

    centerControlDiv.index = 1;
    centerControlDiv.style['padding-top'] = '10px';
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

    var polyOptions = {
        strokeWeight: 0,
        fillOpacity: 0.45,
        editable: true
    };

    // Creates a drawing manager attached to the map that allows the user to draw
    // markers, lines, and shapes.
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        markerOptions: {
            draggable: true
        },
        polylineOptions: {
            editable: true
        },
        rectangleOptions: polyOptions,
        circleOptions: polyOptions,
        polygonOptions: polyOptions,
        map: map
    });

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
        
        if (e.type == google.maps.drawing.OverlayType.POLYGON) {
            addDeleteButton(e.overlay, 'http://i.imgur.com/RUrKV.png');
        }
        if (e.type != google.maps.drawing.OverlayType.MARKER) {
            
            // Switch back to non-drawing mode after drawing a shape.
            drawingManager.setDrawingMode(null);

            // Add an event listener that selects the newly-drawn shape when the user
            // mouses down on it.
            var newShape = e.overlay;
            newShape.type = e.type;
            google.maps.event.addListener(newShape, 'click', function() {
                setSelection(newShape);
            });
        
            setSelection(newShape);
        }
    });

    // Clear the current selection when the drawing mode is changed, or when the
    // map is clicked.
    google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
    google.maps.event.addListener(map, 'click', clearSelection);
}


google.maps.event.addDomListener(window, 'load', initialize);
