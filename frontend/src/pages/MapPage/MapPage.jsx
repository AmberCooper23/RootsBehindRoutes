import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import { fetchAllPlaces } from "../../../api/placesApi";
import { fetchAllActivities } from "../../../api/activitiesApi";
import "./MapPage.css";

const mapStyles = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#f5f0e6" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9d6df" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: -26.2041,
  lng: 28.0473,
};

export function MapPage() {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [mapCenter, setMapCenter] = useState(center);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [places, activities] = await Promise.all([
          fetchAllPlaces(),
          fetchAllActivities(),
        ]);

        // Cast strings to numbers and filter out invalid coordinates
        const validExperiences = [...places, ...activities]
          .map((item) => {
            const lat = Number(item.location?.latitude);
            const lng = Number(item.location?.longitude);

            if (!isNaN(lat) && !isNaN(lng)) {
              return {
                ...item,
                location: {
                  ...item.location,
                  latitude: lat,
                  longitude: lng,
                },
              };
            }
            return null;
          })
          .filter(Boolean);

        setExperiences(validExperiences);
      } catch (error) {
        console.error("Failed to load map data:", error);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);
          setMapCenter(userPos);

          const placesWithDistance = experiences.map((exp) => {
            const dist = getDistanceFromLatLonInKm(
              userPos.lat,
              userPos.lng,
              exp.location.latitude,
              exp.location.longitude,
            );
            return { ...exp, distance: dist };
          });

          const sorted = placesWithDistance.sort(
            (a, b) => a.distance - b.distance,
          );
          setNearbyPlaces(sorted.slice(0, 5));
        },
        (error) => {
          console.warn("Geolocation error:", error);
        },
      );
    }
  }, [experiences]);

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <main className="mapPage">
      <section className="mapContainer">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={13}
          options={{
            styles: mapStyles,
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {userLocation && (
            <MarkerF
              position={userLocation}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}

          {experiences.map((exp) => (
            <MarkerF
              key={exp.id}
              position={{
                lat: exp.location.latitude,
                lng: exp.location.longitude,
              }}
              onClick={() => navigate(`/Details/${exp.type}/${exp.id}`)}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/brown-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          ))}
        </GoogleMap>
      </section>

      <aside className="mapSidebar">
        <header className="mapSidebarHeader">
          <h2>Places Near You</h2>
          <p>Locally endorsed spots close to your current location.</p>
        </header>

        <div className="mapSidebarList">
          {nearbyPlaces.length > 0 ? (
            nearbyPlaces.map((place, index) => (
              <div
                key={place.id}
                className="mapSidebarCard"
                onClick={() => navigate(`/Details/${place.type}/${place.id}`)}
              >
                <div className="mapSidebarCardNumber">{index + 1}</div>
                <div className="mapSidebarCardContent">
                  <h3>{place.name}</h3>
                  <p>{place.distance.toFixed(1)} km away</p>
                </div>
              </div>
            ))
          ) : (
            <p className="mapSidebarEmpty">Calculating distances...</p>
          )}
        </div>
      </aside>
    </main>
  );
}

export default MapPage;
