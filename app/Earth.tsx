import { useFocusEffect, useTheme } from "@react-navigation/native";
import * as Location from "expo-location";
import { Accelerometer, Magnetometer } from "expo-sensors";
import React, { useCallback, useMemo, useState } from "react";
import { Text } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import countries from "./../data/countries.json";
import createCommonStyles from "./commonStyles";

const HARDCODED_LOCATION = {
  latitude: 51.275298,
  longitude: 30.2115858,
};

type Country = {
  name: string;
  lat: number;
  lon: number;
  latitude: number;
  longitude: number;
};

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in km
}

export function findClosestCountry(
  userLat: number,
  userLon: number,
  countries: Country[],
): { country: Country; distance: number }[] | null {
  if (!countries.length) return null;
  let sortedByDistance = [];
  // let closest = null;
  let minDistance = Infinity;
  //let maxDistance = 1000;
  for (const country of countries) {
    const distance = haversineDistance(userLat, userLon, country.latitude, country.longitude);

    if (distance < minDistance) {
      //if (maxDistance > distance) {
      sortedByDistance.push({ distance, country });
      //}
      //minDistance = distance;
      //closest = country;
    }
  }

  const sorted = sortedByDistance.sort((a, b) => a.distance - b.distance) ?? [];
  return sorted;
}

export default function MenuList() {
  const theme = useTheme();
  const commonStyles = createCommonStyles(theme);
  const [grantedPermission, setGrantedPermission] = useState(false);
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [location, setLocation] = useState<Pick<Location.LocationObjectCoords, "latitude" | "longitude"> | null>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!grantedPermission) return;
      if (location) return;
      let interval = setInterval(
        () =>
          (async () => {
            try {
              let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Lowest,
              });
              setLocation(location.coords);
            } catch (e) {
              setErrorMsg("can't get the location, using hardcoded one...");
              setLocation(HARDCODED_LOCATION);
            }
          })(),
        2 * 1000,
      );
      return () => clearInterval(interval);
    }, [location, grantedPermission]),
  );

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          console.error("Permission to access location was denied");
          return;
        }
        setGrantedPermission(true);
      })();
    }, []),
  );

  // 2️⃣ Sensors
  useFocusEffect(
    useCallback(() => {
      Magnetometer.setUpdateInterval(1000);
      Accelerometer.setUpdateInterval(1000);

      const magSub = Magnetometer.addListener((data) => {
        const angle = Math.atan2(data.y, data.x);
        setHeading(angle);
      });

      const accSub = Accelerometer.addListener((data) => {
        const p = Math.atan2(data.y, data.z);
        setPitch(p);
      });

      return () => {
        magSub.remove();
        accSub.remove();
      };
    }, []),
  );

  const closest = useMemo(
    () => findClosestCountry(location?.latitude, location?.longitude, countries) ?? {},
    [location],
  );

  let text = "Waiting...";
  if (location) {
    text = JSON.stringify(location);
  }

  return (
    <SafeAreaView style={commonStyles.view}>
      <Text style={commonStyles.header}>Sensors data:</Text>
      <Text style={commonStyles.text}>Accelerometer pitch: {pitch}</Text>
      <Text style={commonStyles.text}>Magnetometer heading: {heading}</Text>
      {errorMsg ? <Text style={commonStyles.error}>Error: {errorMsg}</Text> : null}
      <Text style={commonStyles.header}>Closest countries:</Text>
      {text && !errorMsg ? <Text style={commonStyles.text}>Location: {text}</Text> : null}
      <FlatList
        initialNumToRender={2}
        windowSize={4}
        data={closest ?? []}
        keyExtractor={(item) => String(item.country.id)}
        renderItem={({ item }) => (
          <Text style={commonStyles.text}>{`${item?.country.name} ${Math.round(item?.distance)}km`}</Text>
        )}
      />
    </SafeAreaView>
  );
}
