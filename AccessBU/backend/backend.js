const https = require('https');
const apiKey = 'AIzaSyCxKzb1TTNef3e0wcQcnurbtLHSZendI3Y';
const testOrigin = '700 Commonwealth Ave, Boston, MA 02215'
const testDestination = '915 Commonwealth Ave, Boston, MA 02215'
let OriginCoord; // Variable to store the coordinates
let DestinationCoord; // Variable to store the coordinates
// Test Entrances
const AccessibleEntrances = [
    { lat: 42.35171, lng: -71.117284 },
    { lat: 42.352122, lng: -71.116491 },
    { lat: 42.35424862, lng: -71.12337835 },
    { lat: 42.353867, lng: -71.120796 },
    { lat: 42.353496, lng: -71.120377 },
    { lat: 42.352986, lng: -71.120377 },
    { lat: 42.352677, lng: -71.119792 },
    { lat: 42.35226816, lng: -71.12131563 },
    { lat: 42.351834, lng: -71.120309 },
    { lat: 42.352608, lng: -71.118355 },
    { lat: 42.351575, lng: -71.117873 },
    { lat: 42.352038, lng: -71.117202 },
    { lat: 42.35171, lng: -71.117284 },
    { lat: 42.351107, lng: -71.117772 },
    { lat: 42.350628, lng: -71.118316 },
    { lat: 42.350327, lng: -71.117664 },
    { lat: 42.352122, lng: -71.116491 },
    { lat: 42.352242, lng: -71.116019 },
    { lat: 42.352059, lng: -71.115576 },
    { lat: 42.351903, lng: -71.115582 },
    { lat: 42.351623, lng: -71.115211 },
    { lat: 42.351184, lng: -71.114688 },
    { lat: 42.350605, lng: -71.115861 },
    { lat: 42.351165, lng: -71.114665 }
];


function calculateDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    const R = 6371; // Radius of the earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// function determineClosestDestination(destinationCoord, callback) {
//     const [destLat, destLng] = destinationCoord.split(',').map(Number);
//     const point1 = { lat: 42.35171, lng: -71.117284 };
//     const point2 = { lat: 42.352122, lng: -71.116491 };

//     const distanceToPoint1 = calculateDistance(destLat, destLng, point1.lat, point1.lng);
//     const distanceToPoint2 = calculateDistance(destLat, destLng, point2.lat, point2.lng);

//     console.log("this is distance")

//     if ((distanceToPoint1 < distanceToPoint2)) {
//         console.log('Destination is closer to Point 1');
//         callback(null, `${point1.lat},${point1.lng}`);
//     } else {
//         console.log('Destination is closer to Point 2');
//         callback(null, `${point2.lat},${point2.lng}`);
//     }
// }

function determineClosestDestination(destinationCoord, AccessibleEntrances, callback) {
    const [destLat, destLng] = destinationCoord.split(',').map(Number);
    if (!Array.isArray(AccessibleEntrances)) {
        callback(new Error('Points is not an array'));
        return;
    }

    let closestPoint = null;
    let closestDistance = Infinity;

    AccessibleEntrances.forEach(point => {
        const distance = calculateDistance(destLat, destLng, point.lat, point.lng);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPoint = point;
        }
    });

    if (closestPoint) {
        console.log(`Destination is closer to Point: ${closestPoint.lat},${closestPoint.lng}`);
        callback(null, `${closestPoint.lat},${closestPoint.lng}`);
    } else {
        callback(new Error('No closest point found'));
    }
}

// This function creates a long and lat for the input address
function geocodeAddress(address, apiKey, callback) {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    https.get(url, res => {
        let data = '';

        res.on('data', chunk => {
            data += chunk;
        });

        res.on('end', () => {
            const response = JSON.parse(data);
            if (response.status === 'OK') {
                const location = response.results[0].geometry.location;
                // Format the location as a string "lat,lng"
                const locationStr = `${location.lat},${location.lng}`;
                callback(null, locationStr);
            } else {
                callback(new Error('Geocoding failed'));
            }
        });
    }).on("error", err => {
        callback(err);
    });
}

function getDirections(originCoords, destinationCoords, apiKey) {
    // Since the input is already in coordinates format, no need for encodeURIComponent
    const origin = originCoords;
    const destination = destinationCoords;

    // Add waypoints as latitude and longitude coordinates
    // const stoplights = [
    //     { lat: 42.35135562, lng: -71.11583394 },
    //     { lat: 42.35094121, lng: -71.11591662 },
    //     { lat: 42.35092989, lng: -71.11573458 },
    //     { lat: 42.35131338, lng: -71.115641 },
    //     { lat: 42.35020661, lng: -71.10664062 },
    //     { lat: 42.34985392, lng: -71.10676672 },
    //     { lat: 42.34981235, lng: -71.10647767 },
    //     { lat: 42.35018941, lng: -71.10644469 }
    // ];
    
    // const waypoints = stoplights.map(s => `${s.lat},${s.lng}`).join('|');

    const waypoints = [
        // '42.346676,-71.097218', // Example coordinates
        // '42.349046,-71.095313'  // More coordinates
        ''
    ].join('|');

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints}&mode=walking&key=${apiKey}`;

    https.get(url, res => {
        let data = '';

        res.on('data', chunk => {
            data += chunk;
        });

        res.on('end', () => {
            const parsedData = JSON.parse(data);

            if (parsedData.routes.length > 0 && parsedData.routes[0].legs.length > 0) {
                const leg = parsedData.routes[0].legs[0];
                const originLocation = leg.start_location;
                const destinationLocation = leg.end_location;
                const distance = leg.distance;
                const duration = leg.duration;

                console.log('Origin Location:', originLocation);
                console.log('Destination Location:', destinationLocation);
                console.log('Total Distance:', distance.text);
                console.log('Estimated Duration:', duration.text);
            } else {
                console.log('No routes or legs found in the response');
            }
        });

    }).on("error", err => {
        console.log("Error: " + err.message);
    });
}

// geocodeAddress(testOrigin, apiKey, (err, originCoord) => {
//     if (err) {
//         console.log('Error geocoding origin:', err.message);
//         return;
//     }

//     geocodeAddress(testDestination, apiKey, (err, destinationCoord) => {
//         if (err) {
//             console.log('Error geocoding destination:', err.message);
//             return;
//         }

//         determineClosestDestination(destinationCoord, (err, newDestinationCoord) => {
//             if (err) {
//                 console.log('Error determining closest destination:', err.message);
//                 return;
//             }
//             // Now call getDirections with the updated newDestinationCoord
//             getDirections(originCoord, newDestinationCoord, apiKey);
//         });
//     });
// });

geocodeAddress(testOrigin, apiKey, (err, originCoord) => {
    if (err) {
        console.log('Error geocoding origin:', err.message);
        return;
    }

    geocodeAddress(testDestination, apiKey, (err, destinationCoord) => {
        if (err) {
            console.log('Error geocoding destination:', err.message);
            return;
        }

        determineClosestDestination(destinationCoord, AccessibleEntrances, (err, newDestinationCoord) => {
            if (err) {
                console.log('Error determining closest destination:', err.message);
                return;
            }
            // Now call getDirections with the updated newDestinationCoord
            getDirections(originCoord, newDestinationCoord, apiKey);
        });
    });
});