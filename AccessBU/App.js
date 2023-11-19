import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View, Button, Pressable, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import polyline from '@mapbox/polyline';
import RenderHTML from 'react-native-render-html';
import * as Tts from 'expo-speech';
import * as Speech from 'expo-speech';


const GOOGLE_MAPS_APIKEY = 'AIzaSyCxKzb1TTNef3e0wcQcnurbtLHSZendI3Y'; // Replace with your Google Maps API key
let recvPayload = {};

function removeHTMLTags(str) {
  return str.replace(/<[^>]*>?/gm, '');
}
function TicTacToeScreen() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const winner = calculateWinner(board);

  function handleClick(i) {
    const boardCopy = [...board];
    if (winner || boardCopy[i]) return;
    boardCopy[i] = xIsNext ? 'X' : 'O';
    setBoard(boardCopy);
    setXIsNext(!xIsNext);
  }

  function resetBoard() {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  }

  function renderSquare(i) {
    return <Button title={board[i] ? board[i] : ' '} onPress={() => handleClick(i)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </View>
      <View style={styles.row}>
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </View>
      <View style={styles.row}>
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </View>
      <Text style={{textAlign: 'center', fontSize: 16,}}>
        {winner ? 'Winner: ' + winner : 'Next Player: ' + (xIsNext ? 'X' : 'O')}
      </Text>
      <Button title="Reset Board" onPress={resetBoard} />
      <Text style={{textAlign: 'center', fontSize: 16,}}>
        {"\n"}Have you seen an accessible entrance{"\n"}or audible crosswalk beacon?{"\n"}
      </Text>
      <Button title="Record AccessPoint"/>
    </View>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [newStartPoint, setNewStartPoint] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const [showStartNavigation, setShowStartNavigation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // To keep track of current step
  const [steps, setSteps] = useState([]); // To store all the steps


  useEffect(() => {
    
    let locationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      function calculateDistance(lat1, lon1, lat2, lon2) {
        const earthRadius = 6371; // Earth's radius in kilometers
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c; // Distance in kilometers
        return distance * 1000; // Convert to meters
      }
      
      function toRadians(degrees) {
        return degrees * (Math.PI / 180);
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
        },
        (newLocation) => {
          console.log('New location obtained:', newLocation);
          setLocation(newLocation);
      
          if (steps.length > 0 && currentStep < steps.length) {
            const nextStep = steps[currentStep];
            const distance = calculateDistance(
              newLocation.coords.latitude,
              newLocation.coords.longitude,
              nextStep.end_location.lat,
              nextStep.end_location.lng
            );

            // If the user is within 20 meters of the next step, display the instruction
            if (distance < 20) {
              setCurrentInstruction(nextStep.html_instructions);
              setCurrentStep(currentStep + 1);
            }
          }
        },
      );
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [currentStep, steps]);

  const getDirections = async (destination, newStartPoint) => {
    try {
      console.log(`Origin: ${location.coords.latitude},${location.coords.longitude}`);
      console.log(`Destination: ${destination}`);
      console.log(`StartPoint: ${newStartPoint}`)
  
      // const response = await fetch(
      //   `https://maps.googleapis.com/maps/api/directions/json?origin=${location.coords.latitude},${location.coords.longitude}&destination=${destination}&mode=walking&key=${GOOGLE_MAPS_APIKEY}`
      // );

      // const response = await fetch(
      //   `https://maps.googleapis.com/maps/api/directions/json?origin=${newStartPoint}&destination=${destination}&mode=walking&key=${GOOGLE_MAPS_APIKEY}`
      // );
      // const data = await response.json();
      await testComm();

      const data = recvPayload;
  
      if (!data.routes.length) {
        console.log('No routes found');
        return;
      }

      const newSteps = data.routes[0].legs[0].steps; // Extracting all steps
      setSteps(newSteps); // Storing all the steps

      const points = polyline.decode(data.routes[0].overview_polyline.points);
      const coords = points.map((point) => ({
        latitude: point[0],
        longitude: point[1],
      }));
      setDirections(coords);
      setShowStartNavigation(true);
    } catch (error) {
      console.error(error);
    }
  };

  const testComm = async () => {
    try {
      const response = await fetch('http://10.239.221.95:2000/testCommunication'); // fix this IP
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // Handle the data from the response
      console.log(data);
      recvPayload = data;
    } catch (error) {
      // Handle any errors that occurred during the fetch
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const [currentInstruction, setCurrentInstruction] = useState('');

  const handleStartNavigation = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Update the current instruction
      const newInstruction = steps[currentStep + 1].html_instructions;
      const newInstructionTAGLESS = removeHTMLTags(steps[currentStep + 1].html_instructions);
      setCurrentInstruction(newInstruction);
      Speech.speak(newInstructionTAGLESS); // Read the instruction aloud
      console.log(`Displaying Step ${currentStep + 1}: ${newInstruction}`);
    } else {
      setCurrentStep(0);
      // Reset the current instruction
      setCurrentInstruction('');
      Speech.stop(); // Stop speaking
      setShowStartNavigation(false);
      console.log('Navigation completed.'); // Indicate when navigation finishes
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.directions}>
        <GooglePlacesAutocomplete
          placeholder='Enter Destination'
          onPress={(data, details = null) => {
            if (details) {
              console.log(details);
              setDestination(details.description);
            }
          }}
          query={{
            key: GOOGLE_MAPS_APIKEY,
            language: 'en',
          }}
        />
        <GooglePlacesAutocomplete
          placeholder='Starting Point'
          onPress={(data, details = null) => {
            if (details) {
              console.log(details);
              setNewStartPoint(details.description);
            }
          }}
          query={{
            key: GOOGLE_MAPS_APIKEY,
            language: 'en',
          }}
        />
        <Button title="Get Directions" onPress={() => getDirections(destination, newStartPoint)} />
        {/* <Button title="Test" onPress={() => testComm()} /> */}
      </View>
      {location && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0022,
            longitudeDelta: 0.0021,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="My Location"
            // pinColor='blue'
          >
          <Image
            source={require('./assets/Subject.png')} // Replace with the correct path to your image
            style={{ width: 45, height: 45 }} // Adjust width and height as needed
          />
          </Marker>
          {directions && (
            <>
              <Polyline
                coordinates={directions}
                strokeWidth={2}
                strokeColor="red"
              />
              <Marker
                coordinate={directions[directions.length - 1]} // New Marker for destination
                title="Destination"
              />
              {showStartNavigation}
            </>
          )}
        </MapView>
      )}
      {showStartNavigation && (
  <View style={styles.navigationButtonContainer}>
    <Pressable
  style={styles.navigationButton}
  onPress={handleStartNavigation}
>
  <Text style={styles.navigationButtonText}>
    {showStartNavigation ? 'Next Step' : 'Start Navigation'}
  </Text>
</Pressable>

    <View style={styles.instructionsContainer}>
      <RenderHTML contentWidth={100} source={{ html: currentInstruction }} />
    </View>
  </View>
)}
      <StatusBar style="auto" />
    </View>
  );}


function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text>About Screen</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;

      if (route.name === 'Home') {
        iconName = focused ? 'home' : 'home-outline';
      } else if (route.name === 'About') {
        iconName = focused ? 'information-circle' : 'information-circle-outline';
      } else if (route.name === 'Contribute') {
        iconName = focused ? 'share' : 'share-outline';
      }

      // You can return any component that you like here!
      return <Ionicons name={iconName} size={size} color={color} />;
    },
  })}
  tabBarOptions={{
    activeTintColor: 'tomato',
    inactiveTintColor: 'gray',
  }}
>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="About" component={AboutScreen} />
  <Tab.Screen name="Contribute" component={TicTacToeScreen} />
</Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  navigationButtonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  navigationButton: {
    backgroundColor: 'tomato',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  navigationButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
});