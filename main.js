cams1 = [];
cams2 = [];
cams3 = [];

function process () {
  // Get total number of cameras for progress meter
  cams = document.getElementById("1").value.split("\n").length +
         document.getElementById("2").value.split("\n").length +
         document.getElementById("3").value.split("\n").length;
  camCount = 0;
  // Once for speed, school zone and red light cameras
  for (a = 0; a < 3; a++) {
    // Get relevent pasted text
    dump = document.getElementById(String(a + 1)).value;
    arrayOfLines = dump.split("\n");
    for (i = 1; i < arrayOfLines.length; i++) {
      // For each camera... If the camera is gone, don't worry about it
      if (arrayOfLines[i].indexOf("removed") == -1 &&
          arrayOfLines[i].indexOf("near") == -1 &&
          arrayOfLines[i].indexOf("decommissioned") == -1) {
        // Red light cameras have a slightly different format
        if (a == 0 || a == 1) {
          // Get the street the camera is on and the two roads it's between
          main = arrayOfLines[i].split("	")[1].split(",")[0];
          first = arrayOfLines[i].split("between ")[1].split(" and")[0];
          second = arrayOfLines[i].split(" and ")[1].split("	")[0].trim();
          // Get coords for intersection between main and first and main and second
          pos1 = getJSON(main, first);
          pos2 = getJSON(main, second);
          try {
            // Get the position between the two cross streets
            // I.E roughly where the camera is
            lat = (pos1.lat + pos2.lat) / 2;
            lng = (pos1.lng + pos2.lng) / 2;
            if (a == 0) {cams1.push([lat,lng]);}
            else {cams2.push([lat,lng]);}
          }
          catch (err) {};
        }
        else {
          // Red light cameras are just the one intersection
          first = arrayOfLines[i].split("	")[1].split(" and ")[0].trim();
          second = arrayOfLines[i].split(" and ")[1].split("	")[0].trim();
          pos = getJSON(first, second);
          try {cams3.push([pos.lat,pos.lng]);}
          catch (err) {};
        }
      }
      camCount++;
      document.title = camCount + " / " + cams + " = " + parseInt(camCount / cams * 100) + "%";
    }
  }
  draw();
}

function getJSON (first, second) {
  pre = "https://maps.googleapis.com/maps/api/geocode/json?address=";
  key = document.getElementById("api").value;
  url = pre + first + "+and+" + second + "&sensor=false&region=au&key=" + key;
  var request = new XMLHttpRequest();
  request.open('GET', url, false);
  request.send(null);
  if (request.status === 200) {
    data = JSON.parse(request.responseText);
    try {
      // Return just the location from the request
      return data.results[0].geometry.location;
    }
    catch (err){
      console.log(request.responseText);
      return null;
    }
  }
}

function draw () {
  for (i = 0; i < cams1.length; i++) {addMarker(cams1[i], "A");}
  for (i = 0; i < cams2.length; i++) {addMarker(cams2[i], "B");}
  for (i = 0; i < cams3.length; i++) {addMarker(cams3[i], "C");}
  document.getElementById("map").style.display = "block";
  document.title = "NSW Speed Cameras"
}

function addMarker (location, label) {
  var marker = new google.maps.Marker({
    position: {lat: location[0], lng: location[1]},
    label: label,
    map: map
  });
}

map = new google.maps.Map(document.getElementById('map'), {
  zoom: 10,
  center: new google.maps.LatLng(-33.85, 151.2),
  disableDefaultUI: true
});