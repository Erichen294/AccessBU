const https = require('https');
const cors = require('cors');
const apiKey = 'AIzaSyCxKzb1TTNef3e0wcQcnurbtLHSZendI3Y';
const testOrigin = '8 St Marys St, Boston, MA 02215'
const testDestination = '915 Commonwealth Ave, Boston, MA 02215'
let OriginCoord; // Variable to store the coordinates
let DestinationCoord; // Variable to store the coordinates

const express = require('express');
const app = express();
let payload = {};

// Add waypoints as latitude and longitude coordinates
const stoplights = [
    { lat: 42.349240808938475, lng: -71.10664866397359 },
    { lat: 42.35135562, lng: -71.11583394 },
    { lat: 42.35094121, lng: -71.11591662 },
    { lat: 42.35092989, lng: -71.11573458 },
    { lat: 42.35131338, lng: -71.115641 },
    { lat: 42.35020661, lng: -71.10664062 },
    { lat: 42.34985392, lng: -71.10676672 },
    { lat: 42.34981235, lng: -71.10647767 },
    { lat: 42.35018941, lng: -71.10644469 },
    { lat:42.351450, lng:-71.116903}  
];

const adjacencyMatrix = [
    [ 0, 160, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [160, 0, 46.57849493285967, 0, 15.012302892518925, 0, 0, 0, 0, 0],
    [0,46.57849493285967, 0, 15.012302892518925, 0, 0, 0, 0, 0, 0],
    [0, 0, 15.012302892518925, 0, 43.33000668116041, 0, 0, 0, 0, 0],
    [0, 15.012302892518925, 0, 43.33000668116041, 0, 749.792054244618, 0, 0, 0, 0],
    [0, 0, 0, 0, 749.792054244618, 0, 40.56332930166704, 0, 24.199152190916113, 0],
    [0, 0, 0, 749.792054244618, 0, 40.56332930166704, 0, 24.199152190916113, 0, 0],
    [0, 0, 0, 0, 0, 0, 24.199152190916113, 0, 42.014664034736946, 83],
    [0, 0, 0, 0, 0, 24.199152190916113, 0, 42.014664034736946, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 83, 0, 0]
];

// Define an API endpoint for test communication
app.get('/testCommunication', (req, res) => {
    // Respond with a simple string
    res.send(payload);
});

// Start the server
app.listen(2000, () => {
    console.log('Server is running on port 3000');
});

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

function dijkstra(adjMatrix, startNode, endNode) {
    const numNodes = adjMatrix.length;
    const distances = new Array(numNodes).fill(Infinity);
    const visited = new Array(numNodes).fill(false);
    const previous = new Array(numNodes).fill(null);

    distances[startNode] = 0;

    for (let i = 0; i < numNodes; i++) {
        // Find the unvisited node with the smallest distance
        let closestNode = -1;
        for (let j = 0; j < numNodes; j++) {
            if (!visited[j] && (closestNode === -1 || distances[j] < distances[closestNode])) {
                closestNode = j;
            }
        }

        visited[closestNode] = true;
        if (closestNode === endNode) {
            break; // We've reached the destination node
        }

        // Update distances for the neighbors of the closest node
        for (let j = 0; j < numNodes; j++) {
            if (adjMatrix[closestNode][j] !== 0) {
                const newDistance = distances[closestNode] + adjMatrix[closestNode][j];
                if (newDistance < distances[j]) {
                    distances[j] = newDistance;
                    previous[j] = closestNode;
                }
            }
        }
    }

    // Reconstruct the shortest path
    const path = [];
    for (let at = endNode; at !== null; at = previous[at]) {
        path.unshift(at); // Prepend node to the path
    }

    return { distance: distances[endNode], path };
}

// Example Usage
const startNode = 0; // Node 0
const endNode = 9;   // Node 7 (equivalent to old Node 8 in 1-based indexing)
const result = dijkstra(adjacencyMatrix, startNode, endNode);
console.log(`Shortest path from node ${startNode} to node ${endNode}:`, result.path);
console.log(`Total distance: ${result.distance}`);


function calculateDistance(lat1, lng1, lat2, lng2) {
    function toRadians(degree) {
        return degree * Math.PI / 180;
    }

    const earthRadiusMeters = 6371000; // Earth's radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    lat1 = toRadians(lat1);
    lat2 = toRadians(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return earthRadiusMeters * c; // Distance in meters
}

// const adjacencyMatrix = Array.from({ length: stoplights.length }, () => new Array(stoplights.length).fill(0));

for (let i = 0; i < stoplights.length - 1; i++) {
    const weight = calculateDistance(
        stoplights[i].lat, stoplights[i].lng,
        stoplights[i + 1].lat, stoplights[i + 1].lng
    );
    adjacencyMatrix[i][i + 1] = weight;    // Weighted edge from stoplight i to i+1
    adjacencyMatrix[i + 1][i] = weight;    // Weighted edge from stoplight i+1 to i (undirected)
}

console.log(adjacencyMatrix);

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
    const stoplights = [
        { lat: 42.35135562, lng: -71.11583394 },
        // { lat: 42.35094121, lng: -71.11591662 },
        // { lat: 42.35092989, lng: -71.11573458 },
        { lat: 42.35131338, lng: -71.115641 },
        { lat: 42.35020661, lng: -71.10664062 },
        { lat: 42.34985392, lng: -71.10676672 },
        { lat: 42.34981235, lng: -71.10647767 }
        // { lat: 42.35018941, lng: -71.10644469 }
    ];
    
    const waypoints = "42.34985392, -71.10676672" //42.35020661, -71.10664062 | 42.35135562, -71.11583394  | 42.35131338, -71.115641 | 42.34981235, -71.10647767

    // const waypoints = [
    //     // '42.346676,-71.097218', // Example coordinates
    //     // '42.349046,-71.095313'  // More coordinates
    //     ''
    // ].join('|');

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints}&mode=walking&key=${apiKey}`;

    https.get(url, res => {
        let data = '';

        res.on('data', chunk => {
            data += chunk;
        });

        res.on('end', () => {
            const parsedData = JSON.parse(data);
            payload = parsedData;

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
