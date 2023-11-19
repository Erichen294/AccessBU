import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View, Button, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import polyline from '@mapbox/polyline';


const GOOGLE_MAPS_APIKEY = 'AIzaSyCxKzb1TTNef3e0wcQcnurbtLHSZendI3Y'; // Replace with your Google Maps API key

function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const [showStartNavigation, setShowStartNavigation] = useState(false);


  useEffect(() => {
    let locationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
        },
        (newLocation) => {
          setLocation(newLocation);
        },
      );
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const getDirections = async (destination) => {
    try {
      console.log(`Origin: ${location.coords.latitude},${location.coords.longitude}`);
      console.log(`Destination: ${destination}`);
  
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${location.coords.latitude},${location.coords.longitude}&destination=${destination}&mode=walking&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
  
      if (!data.routes.length) {
        console.log('No routes found');
        return;
      }
  
      const points = polyline.decode(data.routes[0].overview_polyline.points);
      const coords = points.map(point => {
        return  {
          latitude : point[0],
          longitude : point[1]
        }
      })
      setDirections(coords);
      setShowStartNavigation(true);
    } catch (error) {
      console.error(error);
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
      <Button title="Get Directions" onPress={() => getDirections(destination)} />
    </View>
    {location && (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="My Location"
        />
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
          </>
        )}
      </MapView>
      )}
      {showStartNavigation && (
        <View style={styles.navigationButtonContainer}>
          <Pressable
            style={styles.navigationButton}
            onPress={() => {
              // Action to start navigation can be added here
            }}
          >
            <Text style={styles.navigationButtonText}>Start Navigation</Text>
          </Pressable>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}


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
});
