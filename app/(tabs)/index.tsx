import { CameraView, useCameraPermissions } from "expo-camera";
import { useMemo, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle, Line, Rect } from "react-native-svg";

type DivvyShape = "circle" | "rectangle";

export default function DivvyHomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [pieces, setPieces] = useState(5);
  const [rotation, setRotation] = useState(-90);
  const [radiusScale, setRadiusScale] = useState(1);
  const [shape, setShape] = useState<DivvyShape>("circle");

  const { width, height } = useWindowDimensions();

  const centerX = width / 2;
  const centerY = height / 2;

  const circleRadius = Math.min(width, height) * 0.35 * radiusScale;

  const rectangleWidth = width * 0.75 * radiusScale;
  const rectangleHeight = height * 0.32 * radiusScale;
  const rectangleX = centerX - rectangleWidth / 2;
  const rectangleY = centerY - rectangleHeight / 2;

  const circleLines = useMemo(() => {
    return Array.from({ length: pieces }, (_, index) => {
      const angleDegrees = rotation + index * (360 / pieces);
      const angleRadians = (angleDegrees * Math.PI) / 180;

      return {
        x1: centerX,
        y1: centerY,
        x2: centerX + circleRadius * Math.cos(angleRadians),
        y2: centerY + circleRadius * Math.sin(angleRadians),
      };
    });
  }, [pieces, rotation, centerX, centerY, circleRadius]);

  const rectangleLines = useMemo(() => {
    return Array.from({ length: pieces - 1 }, (_, index) => {
      const lineX = rectangleX + ((index + 1) * rectangleWidth) / pieces;

      return {
        x1: lineX,
        y1: rectangleY,
        x2: lineX,
        y2: rectangleY + rectangleHeight,
      };
    });
  }, [pieces, rectangleX, rectangleY, rectangleWidth, rectangleHeight]);

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
          {shape === "circle" && (
            <>
              <Circle
                cx={centerX}
                cy={centerY}
                r={circleRadius}
                stroke="white"
                strokeWidth={3}
                fill="transparent"
              />

              <Circle cx={centerX} cy={centerY} r={6} fill="white" />

              {circleLines.map((line, index) => (
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
            </>
          )}

          {shape === "rectangle" && (
            <>
              <Rect
                x={rectangleX}
                y={rectangleY}
                width={rectangleWidth}
                height={rectangleHeight}
                stroke="white"
                strokeWidth={3}
                fill="transparent"
              />

              {rectangleLines.map((line, index) => (
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
            </>
          )}
        </Svg>
      </View>

      <View style={styles.topPanel}>
        <Text style={styles.title}>Divvy</Text>
        <Text style={styles.subtitle}>
          {shape} · {pieces} pieces
          {shape === "circle" ? ` · ${(360 / pieces).toFixed(1)}° each` : ""}
        </Text>
      </View>

      <View style={styles.shapeControls}>
        <Button title="Circle" onPress={() => setShape("circle")} />
        <Button title="Rectangle" onPress={() => setShape("rectangle")} />
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
          title="Smaller"
          onPress={() => setRadiusScale((value) => Math.max(0.5, value - 0.1))}
        />

        <Button
          title="Bigger"
          onPress={() => setRadiusScale((value) => Math.min(1.5, value + 0.1))}
        />

        {shape === "circle" && (
          <Button
            title="Rotate"
            onPress={() => setRotation((value) => value + 10)}
          />
        )}
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
    textTransform: "capitalize",
  },
  shapeControls: {
    position: "absolute",
    bottom: 135,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    padding: 12,
    borderRadius: 16,
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