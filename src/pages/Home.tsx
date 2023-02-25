import { useEffect, useState } from "react";
import {
  useGetCurrentLocation,
  useIntervalToGetLocation,
  useWatchLocation,
} from "../hooks/locationHooks";
import styles from "./Home.module.scss";
import { TLLCoordinates } from "../types/locationTypes";
import { getDistanceFromLatLonInM } from "../lib";
import Letter from "../components/Home/Letter";
import { useMyPositionStore } from "../../store/useMyPositionStore";

const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 1000 * 60, // 1 min (1000 ms * 60 sec * 1 minute = 60 000ms)
  maximumAge: 0, // 24 hour
};

const getDistPerLatOrLon = (coordinates: TLLCoordinates, forLatNotLon: boolean) => {
  const coordinatesForDistanceRatio = forLatNotLon
    ? { ...coordinates, lat: coordinates.lat + 0.01 }
    : { ...coordinates, lon: coordinates.lon + 0.01 };

  return getDistanceFromLatLonInM(coordinates, coordinatesForDistanceRatio) * 100;
};
const dummyLetters = [
  { LLCoordinates: { lat: 37.480803, lon: 126.950322 } },
  { LLCoordinates: { lat: 37.481276, lon: 126.950285 } },
  { LLCoordinates: { lat: 37.482551, lon: 126.952349 } },
  { LLCoordinates: { lat: 37.480197, lon: 126.9539 } },
  { LLCoordinates: { lat: 37.479101, lon: 126.95267 } },
  { LLCoordinates: { lat: 37.479137, lon: 126.95141 } },
  { LLCoordinates: { lat: 37.482334, lon: 126.953658 } },
];
const dummyLetters2 = [
  { LLCoordinates: { lat: 37.4789582, lon: 126.944854 } },
  { LLCoordinates: { lat: 37.479733, lon: 126.944718 } },
];

const Home = () => {
  const [radius, setRadius] = useState<number>(400);
  const { heading } = useWatchLocation(geolocationOptions);
  useIntervalToGetLocation(geolocationOptions);
  const myPosition = useMyPositionStore((state) => state.currentCoordinates);
  const viewPosition = useMyPositionStore((state) => state.viewCoordinates);
  const currentLLCoordinates = () => {
    if (viewPosition) return viewPosition;
    return myPosition ? myPosition : { lat: 0, lon: 0 };
  };

  const distPerLat = getDistPerLatOrLon(currentLLCoordinates(), true);
  const distPerLon = getDistPerLatOrLon(currentLLCoordinates(), false);

  const filteredLetters = dummyLetters2.filter(
    (letter) => getDistanceFromLatLonInM(currentLLCoordinates(), letter.LLCoordinates) <= radius
  );
  const LettersDataforDisplay = filteredLetters.map((letter) => ({
    ...letter,
    XYCoordinates: {
      x: (letter.LLCoordinates.lon - currentLLCoordinates().lon) * distPerLon, // m
      y: -(letter.LLCoordinates.lat - currentLLCoordinates().lat) * distPerLat, // m
    },
  }));
  useEffect(() => {
    console.log(currentLLCoordinates());
    console.log(myPosition);
  }, [myPosition]);

  return (
    <div className={styles["home"]}>
      {!currentLLCoordinates() ? (
        <div />
      ) : (
        <>
          <ul className={styles["map"]}>
            <li
              className={styles["current-location"]}
              style={{
                width: `${(20 * 800) / radius}px`,
                height: `${(20 * 800) / radius}px`,
                fontSize: `${(15 * 800) / radius}px`,
                transform: `rotate(${!heading || isNaN(heading) ? 0 : heading}deg)`,
              }}
            >
              A
            </li>
            {LettersDataforDisplay.map((letter, index) => (
              <Letter key={index} letter={letter} radius={radius} />
              // <li
              //   className={styles["letter"]}
              //   key={index}
              //   style={{
              //     transform: `translate(${(letter.XYCoordinates.x / (radius * 2)) * 100}vh, ${
              //       (letter.XYCoordinates.y / (radius * 2)) * 100
              //     }vh)`,
              //   }}
              // >
              //   <button>편지</button>
              // </li>
            ))}
          </ul>
          <ul className={styles["zoom-buttons"]}>
            <li className={styles["zoom-button"]}>
              <button
                onClick={() => {
                  setRadius((prev) => (prev - 200 >= 200 ? prev - 200 : 200));
                }}
              >
                +
              </button>
            </li>
            <li className={styles["zoom-button"]}>
              <button
                onClick={() => {
                  setRadius((prev) => (prev + 200 <= 1400 ? prev + 200 : 1400));
                }}
              >
                -
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default Home;
