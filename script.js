// getting places from APIs
function loadPlaces(position) {
    const params = {
        radius: 3,    // search places not farther than this value (in meters)
        clientId: 'B1MSOJW31HLB5MELFQIIREIZ3LT5KW5ZSH13WDAKTZOXJORX',
        clientSecret: 'YA4JM02LDIC5JMXFZBB0XOCUVRS30THFWJZFJKHMXXX43NM5',
        version: '20300101',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
   const corsProxy = 'https://api.allorigins.win/raw?url=';

    // Foursquare API (limit param: number of maximum places to fetch)
    const endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=30 
        &v=${params.version}`;

     return fetch(endpoint)
        .then((res) => {
            return res.json();
        })
        .then((resp) => {
            console.log('API Response:', resp); // Log the full response
            if (resp && resp.response && resp.response.venues) {
                return resp.response.venues;
            } else {
                throw new Error('Invalid API response structure');
            }
        })
        .catch((err) => {
            console.error('Error with places API', err);
            return []; // Return an empty array to avoid breaking the forEach loop
        });
};


window.onload = () => {
    const scene = document.querySelector('a-scene');

    // first get current user location
    return navigator.geolocation.getCurrentPosition(function (position) {

        // than use it to load from remote APIs some places nearby
        loadPlaces(position.coords)
            .then((places) => {
                places.forEach((place) => {
                    const latitude = place.location.lat;
                    const longitude = place.location.lng;

                    // add place name
                    const placeText = document.createElement('a-link');
                    placeText.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
                    placeText.setAttribute('title', place.name);
                    placeText.setAttribute('scale', '15 15 15');
                    
                    placeText.addEventListener('loaded', () => {
                        window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
                    });

                    scene.appendChild(placeText);
                });
            })
    },
        (err) => console.error('Error in retrieving position', err),
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000,
        }
    );
};