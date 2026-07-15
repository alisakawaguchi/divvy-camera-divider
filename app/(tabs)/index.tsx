import { CameraView, useCameraPermissions } from "expo-camera";
import { useMemo, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

export default function DivvyHomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [pieces, setPieces] = useState(5);
  const [rotation, setRotation] = useState(-90);

  const { width, height } = useWindowDimensions();

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  const lines = useMemo(() => {
    return Array.from({ length: pieces }, (_, index) => {
      const angleDegrees = rotation + index * (360 / pieces);
      const angleRadians = (angleDegrees * Math.PI) / 180;

      return {
        x1: centerX,
        y1: centerY,
        x2: centerX + radius * Math.cos(angleRadians),
        y2: centerY + radius * Math.sin(angleRadians),
      };
    });
  }, [pieces, rotation, centerX, centerY, radius]);

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          Divvy needs camera access to show the cutting guide.
        </Text>
        <Button title="Allow camera" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width={width} height={height}>
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke="white"
            strokeWidth={3}
            fill="transparent"
          />

          <Circle cx={centerX} cy={centerY} r={6} fill="white" />

          {lines.map((line, index) => (
            <Line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="white"
              strokeWidth={3}
            />
          ))}
        </Svg>
      </View>

      <View style={styles.topPanel}>
        <Text style={styles.title}>Divvy</Text>
        <Text style={styles.subtitle}>
          {pieces} pieces · {(360 / pieces).toFixed(1)}° each
        </Text>
      </View>

      <View style={styles.controls}>
        <Button
          title="-"
          onPress={() => setPieces((value) => Math.max(2, value - 1))}
        />

        <Text style={styles.controlText}>{pieces}</Text>

        <Button
          title="+"
          onPress={() => setPieces((value) => Math.min(16, value + 1))}
        />

        <Button
          title="Rotate"
          onPress={() => setRotation((value) => value + 10)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "black",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  permissionText: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 16,
  },
  topPanel: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    color: "white",
    fontSize: 16,
    marginTop: 4,
  },
  controls: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    padding: 16,
    borderRadius: 16,
  },
  controlText: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
  },
});