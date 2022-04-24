var mapCanvas, bounds_GMapFP,
    infowindow      = [],
    markerImage     = '/images/store/icon-marker.png',
    num_open        = 0,
    infowindowLevel = 0,
    marker          = [];

function attachinfowindow(marker, place, i) {
    infowindow[i] = new google.maps.InfoWindow({
        content: '<div class="store-image"><img width="220" src="' + place.image + '"></div>',
        maxWidth: 197,
        disableAutoPan: 0
    });
    google.maps.event.addListener(marker, 'mouseover', function(e) {
        infowindow[num_open].close(mapCanvas, marker);
        infowindow[i].setZIndex(++infowindowLevel);
        infowindow[i].open(mapCanvas, marker);
        num_open = i;
        mapCanvas.setCenter(marker.getPosition());
    });
}

function initMap() {
    mapCanvas = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 13,
        panControl: false,
        scaleControl: false,
        scrollwheel: false
    });

    bounds_GMapFP = new google.maps.LatLngBounds();

    for (var i = 0; i < locations.length; i++) {
        var place = locations[i],
            maLatLng = new google.maps.LatLng(place.lat, place.lng);

        bounds_GMapFP.extend(maLatLng);
        marker[i] = new google.maps.Marker({
            map: mapCanvas,
            position: maLatLng,
            //title: place[3],
            icon: markerImage,
        });
        attachinfowindow(marker[i], place, i);
    }
    mapCanvas.setCenter(bounds_GMapFP.getCenter());
}

app.controller('StoreController', ['$scope', '$http', function($scope, $http) {
    $scope.stores = locations;
    $scope.currentStore = locations[0];
    $scope.cities = [];
    $scope.districts = [];
    $scope.city = customerCity;
    $scope.district = null;

    $scope.selectedOption;
    $scope.selectedOption_district;

    $scope.bloodTypes = [
       {'id' : 1, 'description' : 'O+'},         
       {'id' : 2, 'description' : 'A'},
       {'id' : 3, 'description' : 'B'},
     ];

     // set initial selected option to blood type B
 


    $scope.storeClick = function(index, store) {
        google.maps.event.trigger(marker[index], 'mouseover');
        $scope.currentStore = store;
        //window.location.hash = store.slug;
    };

    $scope.submit = function() {
        if ($scope.district === null) return;
        $http.get('/api/store/' + $scope.district).success(function(response) {
            if (response.length === 0) {
                swal('', messageNoStore);
                return;
            }
            locations = $scope.stores = response;
            $scope.currentStore = $scope.stores[0];
            initMap();
        });
    };

    $scope.sendRecord = function(url){
      $http.post(url, $scope.city, $scope.district);
    }

    $http.get('/api/area/0').success(function(response) {

         $scope.cities = response.cities;
        $scope.districts = response.districts;

        //#request has params
        const urlParams = new URLSearchParams(window.location.search);
        const req_district = urlParams.get('district');
        const req_city = urlParams.get('city');
        if(req_district!= undefined || req_city != undefined){
             var city_id, district_id;
            if (req_city != undefined) {
                // city_id = parseInt(req_city.split(':')[1]);
                city_id = parseInt(req_city);
            }
            if(req_district != undefined){
                district_id = parseInt(req_district.split(':')[1]);
            }

            $scope.selectedOption = $scope.cities.find(item=>item.id==city_id);
            $scope.selectedOption_district =  $scope.districts.find(item=>item.id==district_id);

            $scope.city = $scope.cities.find(item=>item.id==city_id);
            $scope.district = $scope.districts.find(item=>item.id==district_id);

        }else{
            $scope.selectedOption = $scope.cities[0];
            $scope.selectedOption_district = $scope.districts[0];

        }
       

       
    });
}]);
