# mapwrapper
Simple javascript wrapper for maps (Currently only google maps)

```javascript
var mapWrapperObj = new mapWrapper("gmaps", document.getElementById("map"), {
  lat: -34.397,
  lng: 150.644,
  zoom: 8
}, function(){
  console.log("Callback!");
  var marker = mapWrapperObj.addMarker(-34.397, 150.644);
  mapWrapperObj.globalMarkers.push(marker);
});
```
