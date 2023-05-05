import { PropsWithChildren, useEffect, useRef, useState } from "react";
import Marker from "./Marker";
import styles from "../../../pages/Home.module.scss";
import { useDeepCompareEffectForMaps } from "../../../lib/hooks/mapHooks";

interface MapProps extends PropsWithChildren<google.maps.MapOptions> {
  className: string;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  clicks: google.maps.LatLng[];
}

const Map = ({ onClick, onIdle, clicks, className, ...options }: MapProps) => {
  const [map, setMap] = useState<google.maps.Map>();
  const [highLight, setHighlight] = useState<number>();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, { ...options, disableDefaultUI: true }));
    }
  }, []);

  // because React does not do deep comparisons, a custom hook is used
  // see discussion in https://github.com/googlemaps/js-samples/issues/946
  useDeepCompareEffectForMaps(() => {
    if (map) {
      // TODO: mapId 추가하여 마커 로딩 확인
      map.setOptions({ ...options, mapId: "DEMO_MAP_ID" });
    }
  }, [map, options]);

  useEffect(() => {
    if (map) {
      ["click", "idle"].forEach((eventName) => google.maps.event.clearListeners(map, eventName));

      if (onClick) {
        map.addListener("click", onClick);
      }

      if (onIdle) {
        map.addListener("idle", () => onIdle(map));
      }
    }
  }, [map, onClick, onIdle]);

  const onMarkerClick = (index: number) => {
    if (index === highLight) setHighlight(undefined);
    else setHighlight(index);
  };

  return (
    <>
      <div ref={ref} className={className} />
      {map &&
        clicks.map((click, i) => {
          return (
            <Marker
              key={i}
              map={map}
              position={{ lat: click.lat(), lng: click.lng() }}
              onClick={() => onMarkerClick(i)}
            >
              {highLight !== i ? (
                <div className={styles.marker} />
              ) : (
                <div className={styles.highlight}>
                  <div className={styles.letterHeader}>
                    <div className={styles.nickname}>닉네임</div>
                    <div className={styles.createTime}>1분 전</div>
                  </div>
                  <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1774&q=80" />
                  <p className={styles.content}>
                    내용 뭐 쓰지 내용 뭐 쓰지 내용 뭐 쓰지 내용 뭐 쓰지 내용 뭐 쓰지 내용 뭐 쓰지
                    내용 뭐
                  </p>
                  <button className={styles.more}>더보기</button>
                </div>
              )}
            </Marker>
          );
        })}
    </>
  );
};

export default Map;
