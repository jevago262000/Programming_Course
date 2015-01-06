//Global variables
var map, table, dataFilter;

//Initial data
var dataPlaces = [['Name', 'Description', "Type", "Score", "Latitude", "Longitude"],
                 ["UJI", "Universitat Jaume I", "Educational Institution", 100, 39.994225, -0.069983],
                 ["Cathedral of Santa María", "Cathedral of Santa María", "Monument", 56, 39.986231, -0.036847],
                 ["Gambrinus Borrull", "Gambrinus Borrull", "Restaurant/Bar", 23, 39.983400, -0.035208],
                 ["Pizzería Don Pepe", "Pizzería Don Pepe", "Restaurant/Bar", 80, 39.984263, -0.037216],
                 ["Taverna Ca’l Cuc", "Taverna Ca’l Cuc", "Restaurant/Bar", 90, 39.981494, -0.038099],
                 ["Academia Alyma", "Academia Alyma", "Educational Institution", 50, 39.981622, -0.040312],
                 ["Bocatería Zurich", "Bocatería Zurich", "Restaurant/Bar", 14, 39.986180, -0.041197],
                 ["Parc Rafalafena", "Parc Rafalafena", "Public Place", 60, 39.992285, -0.027189],
                 ["Plaça España", "Plaça España", "Public Place", 70, 39.98844, -0.044773]
                ];

//Wait until html loads and get the option selected on the radio buttons
//google.setOnLoadCallback(filterData);
google.maps.event.addDomListener(window, 'load', filterData);

// Load the Visualization API library and the libraries table and corechart
google.load('visualization','1.0',{'packages':['table', 'corechart']});

//Check which is the radio button selected
function checkVisu(divOption){
    var radios = document.getElementsByName(divOption);
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            // get the option of visualization
            return radios[i].value;
        }
    }
}

//Select a radio button
function defineVisu(opDefined){
    var radios = document.getElementsByName("visualization");
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].value == opDefined) {
            // get the option of visualization
            radios[i].checked = true;
        }
    }
}

//Function to filter Data
function filterData(){
    
    option = checkVisu("visualization");
    
    if(option == "All"){
        dataFilter = dataPlaces;
    }
    else{
        //Filter data by option
        dataFilter = dataPlaces.filter(function(item) {
            return (item[2] === option);
        });
        if(dataFilter.length < 1){
            //Check option "All"
            document.getElementsByName("visualization")[0].checked = true;
            dataFilter = dataPlaces;
            alert("There are not places with the type " + option);
        }
        else{
            //Adding the header
            dataFilter.splice(0, 0, dataPlaces[0]);
        }
    }
    initialize();
    var selectedItems = [];
    drawTable(selectedItems);   
}

//Function to define icon of each mark
function defineIcon(type, score){
    
    var colors = checkVisu("color");
    var link, icon;
    
    //If selected Type visualization
    if (colors == "Type"){
        var img;
        switch (type) {
            case "Restaurant/Bar":
                img = "winery.png";
                break;
            case "Shop":
                img = "toys.png";
                break;
            case "Monument":
                img = "museum.png";
                break;
            case "Educational Institution":
                img = "university.png";
                break;
            case "Public Place":
                img = "darkgreen.png";
                break;
        }
        link = "http://google-maps-icons.googlecode.com/files/"        
        icon = link + img;    
    }
    //If selected Score visualization
    else{
        var color;
        if(score >= 0 && score < 20){ color = "FF0000"; }
        
        else if (score >= 20 && score < 40){ color = "FF3399"; }
        
        else if (score >= 40 && score < 60){ color = "CC00FF"; }
        
        else if (score >= 60 && score < 80){ color = "00CCFF"; }
        
        else{ color = "0000FF"; }        
        link = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|";
        icon = link + color;
    }
    return icon;
}

//Initialize the map
function initialize() {
  var mapOptions = {
    zoom: 4,
  }
  
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    //Declaration of variables
    var marker, name, type, score, lat, long, labelLeg;
    var latlng = [];
    var tmp = [];
    var icons = [];
    var colors = checkVisu("color");
    
    //Loop to add markers and infowindows
    for (var i = 1; i < dataFilter.length; i++) {
        
        name = dataFilter[i][0];
        type = dataFilter[i][2];
        score = dataFilter[i][3];
        lat = dataFilter[i][4];
        long = dataFilter[i][5];
        
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, long),
            map: map,
            title: name,
            icon: defineIcon(type, score)
            //animation: google.maps.Animation.DROP
        });
        
        //"If" to create labels of the legend for the markers filtered by Score
        if(colors == "Score"){
            if(score >= 0 && score < 20){ labelLeg = "0 - 20"; }

            else if (score >= 20 && score < 40){ labelLeg = "20 - 40"; }

            else if (score >= 40 && score < 60){ labelLeg = "40 - 60"; }

            else if (score >= 60 && score < 80){ labelLeg = "60 - 80"; }

            else{ labelLeg = "80 - 100"; }
            type = labelLeg;
        }
        
        //Define the unique labels of the legend
        if (tmp.indexOf(type) == -1){
            tmp.push(type);
            icons.push([type, marker.icon]);
        }
        
        latlng[i-1] = marker.position;

        //Adding listener to the mark to open the infowindow by showing contentString
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                var contentString = '<div id="content">'+
                                    '<div id="siteInfo">'+
                                    '</div>'+
                                    '<h4 id="firstHeading" class="firstHeading">' + dataFilter[i+1][0] + '</h4>'+
                                    '<div id="bodyContent">'+
                                    '<p><b>Description: </b>'+ dataFilter[i+1][1] + '<br>' +
                                    '<p><b>Type: </b>'+ dataFilter[i+1][2] + '<br>' +
                                    '<p><b>Score: </b>'+ dataFilter[i+1][3] + '<br>' +
                                    '</div>'+
                                    '</div>';
                var infoWindow = new google.maps.InfoWindow({content: contentString, maxWidth:300});
                infoWindow.open(map, marker);
            }
        })(marker, i-1));
    }
    
    //latlong is an arrray with coordinates elements
    var latlngbounds = new google.maps.LatLngBounds();
    for (var i = 0; i < latlng.length; i++) {
      latlngbounds.extend(latlng[i]);
    }
    //Set of center and bounds of visualization
    map.setCenter(latlngbounds.getCenter());
    map.fitBounds(latlngbounds);
    
    //Sort the array for the correct order in the legend
    icons.sort();
    
    //Configuration of legend
    var legend = document.createElement('div');
    legend.id = 'legend';
    legend.index = 1;
    legend.innerHTML = '<h3>Legend by ' +colors+ '</h3>';
    for (var key in icons) {
        var name = icons[key][0];
        var icon = icons[key][1];
        var div = document.createElement('div');
        div.innerHTML = '<img src="' + icon + '"> ' + name;
        legend.appendChild(div);
    }
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
    
    var infoWindowRec;
    
    //Function to check if there are points within the rectangle. At the same time creates the infoWindow for the rectangle
    function geneDataInfoW(rectangle){
        var ne = rectangle.getBounds().getNorthEast();
        var sw = rectangle.getBounds().getSouthWest();
        var newData = [];
        var sum = 0;
        var numPoint = 1;
        for (var i = 1; i < dataFilter.length; i++) {
            if(dataFilter[i][4] <= ne.lat() && dataFilter[i][4] >= sw.lat() && dataFilter[i][5] >= sw.lng() && dataFilter[i][5] <= ne.lng()){
                //Set to string to have discrete values in the x axis
                newData.push([numPoint.toString(), dataFilter[i][3], 0]);
                sum = sum + Number(dataFilter[i][3]);
                numPoint++;
            }
        }
        if(newData.length > 0){
            //Adding the header
            newData.splice(0, 0, ["Place", "Score", "Average"]);
            var average = sum/(numPoint-1);
            
            //Populate data with average
            for (var r = 1; r < newData.length; r++) {
                newData[r][2] = average;
            }
            
            var dataChart = google.visualization.arrayToDataTable(newData);

            // Set chart options
            var options = {title:'Score of the Places', width:280, height:150, legend: {position: 'right'},
                           hAxis: {title: 'Place',  titleTextStyle: {color: 'black'}},
                           seriesType: 'bars', series: {1: {type: 'line'}}
                          };

            var node = document.createElement('div');            
            var chart = new google.visualization.ComboChart(node);

            chart.draw(dataChart, options);
            infoWindowRec = new google.maps.InfoWindow({content: node, maxWidth:350});
            //Set position in the north latitude and in the mean longitude
            infoWindowRec.setPosition(new google.maps.LatLng(ne.lat(), (ne.lng() + sw.lng())/2));
            infoWindowRec.open(map);
        }
        else{
            alert("There are no points within the rectangle! Please move/modify it.");
        }
    }

    //Configuration of drawing tools
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.RECTANGLE]
        },
        rectangleOptions: {
        clickable: true,
        editable: true,
        draggable: true,
        zIndex: 1
        }
    });
    
    //Definition of events when the rectangle is done
    google.maps.event.addListener(drawingManager, 'rectanglecomplete', function(rectangle) {
        drawingManager.setDrawingMode(null);//Changes to hand to stop of drawing
         /* DOES WORK */
        google.maps.event.addListener(rectangle, 'click', function() {
            //"If" to analyze wheter there is open other infowindow of the rectangle
            if (typeof(infoWindowRec) != 'undefined') {infoWindowRec.close();}
            geneDataInfoW(this);
        });
        //Event to delete rectangle and infowindow when drawing mode changed
        google.maps.event.addListener(drawingManager, 'drawingmode_changed', function() {
            rectangle.setMap(null);
            if (typeof(infoWindowRec) != 'undefined') {infoWindowRec.close();}
        });
    });
    
    drawingManager.setMap(map);   
}

//Add listener to the DOM to load the map
//google.maps.event.addDomListener(window, 'load', initialize);

// ... draw the table...
function drawTable(selectedItems){
    
    //Options to allow barformat (score column) and pagination
    var options = {allowHtml: true, page:'enable', pageSize: 10};
    table = new google.visualization.Table(document.getElementById('table-canvas'));
    var dataTable = google.visualization.arrayToDataTable(dataFilter);

    function zoomTo(){
        //The select handler. Call the table's getSeclection() method
        var selectedItem = table.getSelection()[0];
        if (selectedItem){
            var lat = dataFilter[selectedItem.row+1][4];
            var long = dataFilter[selectedItem.row+1][5];
            map.setZoom(17);
            map.setCenter(new google.maps.LatLng(lat, long));         
        }   
    }   

    // Listen for the 'select' event, and call my function zoomTo() when the user selects something on the table.
    google.visualization.events.addListener(table, 'select', zoomTo);
    
    //Definition of parameters for the score column. The score has to be between 0-100, base indicates the threshold for the colors
    var formatter = new google.visualization.BarFormat({width: 100, min:0, max:100, colorNegative:'red', colorPositive:'blue', base:50});
    formatter.format(dataTable, 3); // Apply formatter to the fourth column
    
    //Creating a view to hidde columns Lat and Long
    view = new google.visualization.DataView(dataTable);
    view.hideColumns([4,5]);
    
    table.draw(view, options);
    
    //Keep selected the row by according to increase/decrease functions
    if (selectedItems.length==1){
        table.setSelection(selectedItems);
    }
}

//Catch coordinates from the map
function catchCoor(){
    // add a click event handler to the map object
    google.maps.event.addListener(map, 'click', function(event) {
        //Display the lat/lng in the form's lat/lng fields
        document.getElementById("myForm").elements.namedItem("lat").value = event.latLng.lat();
        document.getElementById("myForm").elements.namedItem("long").value = event.latLng.lng();        
    });
    
    google.maps.event.addListener(map, 'mousemove', function(event) {
        map.setOptions({ draggableCursor: 'crosshair' });        
    });
    
    //google.maps.event.addListener(map, 'mouseout', function(event) {
        //google.maps.event.clearListeners(map, 'mousemove');        
    //});
}

//Function to add a place
function addPlace(form){
    
    if(validate(form)){
        
        var name = form.name.value;
        var desc = form.desc.value;
        var typePlace = form.typePlace.value;
        var score = form.score.value;
        var lat = form.lat.value;
        var long = form.long.value;
        
        //Use of splice function to insert element at index 1
        //It is necessary to convert in numbers the values, because the BarFormat for data just receive numbers
        dataPlaces.splice(1, 0, [name, desc, typePlace, Number(score), Number(lat), Number(long)]);
        defineVisu(typePlace);
        filterData();    
    }    
}

//Validation of the form
function validate(form){
    
    function checkMenu(menu){
        return (menu.selectedIndex > 0);
    }
    
    function isValid(variable, min , max) {
        if (variable < min || variable > max) 
        {
            return false;
        }
        return true;
    }
    
    function checkCoor(lat, long) {
        for (i = 1; i < dataPlaces.length; i++){        
            if (dataPlaces[i][4] == lat && dataPlaces[i][5] == long) 
            {
                return false;
            }
        }
        return true;
    }

    function reportErrors(errors){
        var msg = "There was/were some problem(s)...\n";
        var numError;
        for (var i = 0; i<errors.length; i++) {
            numError = i + 1;
            msg += "\n" + numError + ". " + errors[i];
        }
        alert(msg);
    }
    
    //Errors array
	var errors = [];

	if( form.name.value == "" ) {
		errors[errors.length] = "You must provide a name for the place.";
	}
    
	if( form.desc.value == "" ) {
		errors[errors.length] = "You must provide a short description of the place.";
	}
    
   	if ( !checkMenu(form.typePlace) ) {
		errors[errors.length] = "You must select a type.";
	}
    
    if( form.score.value == "" ) {
		errors[errors.length] = "You must provide a score to rate the place.";
	}
    
    else if( isNaN(form.score.value) ) {
		errors[errors.length] = "You must input numbers for the score.";
	}
    
    else if( !isValid(form.score.value, 0, 100) ) {
		errors[errors.length] = "The score has to be between 0 and 100.";
    }
	
    if( form.lat.value == "" ) {
		errors[errors.length] = "You must provide the Latitude of the place.";
	}
    
    else if( isNaN(form.lat.value) ) {
		errors[errors.length] = "You must input numbers for the Latitude.";
	}
    
    else if( !isValid(form.lat.value, -90, 90) ) {
		errors[errors.length] = "The Latitude has to be between -90 and 90.";
    }
    
    if( form.long.value == "" ) {
		errors[errors.length] = "You must provide the Longitude of the place.";
	}
    
    else if( isNaN(form.long.value) ) {
		errors[errors.length] = "You must input numbers for the Longitude.";
	}
    
    else if( !isValid(form.long.value, -180, 180) ) {
		errors[errors.length] = "The Longitude has to be between -180 and 180.";
    }
    
    if( !checkCoor(form.lat.value, form.long.value) ) {
		errors[errors.length] = "There is other place with the same coordinates.";
    }
    
    if (errors.length > 0) {
		reportErrors(errors);
		return false;
	}
	
	return true;
}

//Function to check if the new value has changed of the interval
function checkInterval(currValue, newValue){
    var values = [currValue, newValue];
    var temp = [];
    for(var value in values){
        var counter = 1;
        for(var k = 0; k <= 80; k = k + 20){
            if(values[value] >= k && values[value] < k + 20){
                temp.push(counter);
                break;
            }
            counter++;
        }            
    }
    if (temp[0] == temp[1]){
        return false;
    }
    return true;
}

//Function to increase the score of the selected place by 10
function increScore(){    
    var selectedItems = table.getSelection();
    if (selectedItems.length==1){
        var currentValue = dataFilter[selectedItems[0].row + 1][3];      
        if (currentValue==100){
            alert("The current score is the maximun allowed score (100)!")
        }
        else{        
            var newValue = currentValue + 10;
            if (newValue > 100){
                newValue = 100;
                alert("The score will be set at 100!");
            }
            //dataPlaces[row][3] = newValue;
            dataFilter[selectedItems[0].row + 1][3] = newValue;
            if(checkVisu("color") == "Score"){
                //If the value has changed of interval, reload the map to change the symbology
                if(checkInterval(currentValue, newValue)){                
                    var lat = dataFilter[selectedItems[0].row+1][4];
                    var long = dataFilter[selectedItems[0].row+1][5];
                    initialize();
                    map.setZoom(17);
                    map.setCenter(new google.maps.LatLng(lat, long));
                }
            }                
            drawTable(selectedItems);            
        }
    }
    else {alert("Please select just one row (place)!");}
}

//Function to decrease the score of the selected place by 10
function decreScore(){
    var selectedItems = table.getSelection();
    if (selectedItems.length==1){
        var currentValue = dataFilter[selectedItems[0].row + 1][3];       
        if (currentValue==0){
            alert("The current score is the minimum allowed score (0)!")
        }
        else{        
            var newValue = currentValue - 10;
            if (newValue < 0){
                newValue = 0;
                alert("The score will be set at 0!");
            }            
            //dataPlaces[row][3] = newValue;
            dataFilter[selectedItems[0].row + 1][3] = newValue;
            if(checkVisu("color") == "Score"){
                //If the value has changed of interval, reload the map to change the symbology
                if(checkInterval(currentValue, newValue)){                
                    var lat = dataFilter[selectedItems[0].row+1][4];
                    var long = dataFilter[selectedItems[0].row+1][5];
                    initialize();
                    map.setZoom(17);
                    map.setCenter(new google.maps.LatLng(lat, long));
                }
            }
            drawTable(selectedItems);
        }
    }
    else {alert("Please select just one row (place)!");}
}

//Function to delete places
function delPlaces(){
    var selectedItems = table.getSelection();
    //alert(JSON.stringify(selectedItems, null, 4));
    if (selectedItems.length > 0){
        var positions = [];
        for (var j=0; j<selectedItems.length; j++){
            positions.push(selectedItems[j].row + 1);
        }
        
        //Sort numbers in ascending order:
        positions.sort(function(a, b){return a-b});

        //First it is necessary to sort in ascending order the positions array and then to apply the slice function, 
        //because after eache slice the indexes of the elements change (move up). This is the solution
        //to the problem of selecting in different order the rows on the table.
        var h = 0;
        for (var k=0; k<positions.length; k++){
            //Use of splice function to delete element
            //dataPlaces.splice(row, 1);
            dataFilter.splice(positions[k] + h, 1);
            h--;
        }
        initialize();
        var selectedItems = [];
        drawTable(selectedItems);    
    }
    else {alert("Please select at least one row (place)!");}
}

//Change backgrund color on focus
function chBackground (x){
    x.style.background = "#F0F0F0";
}

//"Remove" backgrund color on mouse out
function reBackground (x){
    x.style.background = "#ffffff";
}
