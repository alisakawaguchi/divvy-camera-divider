import Slider from "@react-native-community/slider";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle, Line, Rect } from "react-native-svg";

type DivvyShape = "circle" | "rectangle";
type RectangleDirection = "horizontal" | "vertical";

export default function DivvyHomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [pieces, setPieces] = useState(5);
  const [sizeScale, setSizeScale] = useState(1);
  const [shape, setShape] = useState<DivvyShape>("circle");
  const [rectangleDirection, setRectangleDirection] =
    useState<RectangleDirection>("horizontal");
  const [controlsVisible, setControlsVisible] = useState(true);

  const { width, height } = useWindowDimensions();

  const centerX = width / 2;
  const centerY = height / 2;

  const circleRadius = Math.min(width, height) * 0.35 * sizeScale;

  const rectangleWidth = width * 0.8 * sizeScale;
  const rectangleHeight = height * 0.28 * sizeScale;
  const rectangleX = centerX - rectangleWidth / 2;
  const rectangleY = centerY - rectangleHeight / 2;

  const circleLines = useMemo(() => {
    return Array.from({ length: pieces }, (_, index) => {
      const angleDegrees = -90 + index * (360 / pieces);
      const angleRadians = (angleDegrees * Math.PI) / 180;

      return {
        x1: centerX,
        y1: centerY,
        x2: centerX + circleRadius * Math.cos(angleRadians),
        y2: centerY + circleRadius * Math.sin(angleRadians),
      };
    });
  }, [pieces, centerX, centerY, circleRadius]);

  const rectangleLines = useMemo(() => {
    return Array.from({ length: pieces - 1 }, (_, index) => {
      if (rectangleDirection === "horizontal") {
        const lineX = rectangleX + ((index + 1) * rectangleWidth) / pieces;

        return {
          x1: lineX,
          y1: rectangleY - 40,
          x2: lineX,
          y2: rectangleY + rectangleHeight + 40,
        };
      }

      const lineY = rectangleY + ((index + 1) * rectangleHeight) / pieces;

      return {
        x1: rectangleX - 40,
        y1: lineY,
        x2: rectangleX + rectangleWidth + 40,
        y2: lineY,
      };
    });
  }, [
    pieces,
    rectangleDirection,
    rectangleX,
    rectangleY,
    rectangleWidth,
    rectangleHeight,
  ]);

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          Divvy needs camera access to show the cutting guide.
        </Text>
        <Pressable style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Allow camera</Text>
        </Pressable>
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
                strokeDasharray="10 8"
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
          {shape === "rectangle" ? ` · ${rectangleDirection} cuts` : ""}
        </Text>
      </View>

      {controlsVisible ? (
        <View style={styles.controlsPanel}>
          <View style={styles.controlsHeader}>
            <Text style={styles.controlsTitle}>Controls</Text>

            <Pressable
              style={styles.closeButton}
              onPress={() => setControlsVisible(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.controlGroup}>
            <Text style={styles.label}>Select shape</Text>

            <View style={styles.segmentedControl}>
              <Pressable
                style={[
                  styles.segmentButton,
                  shape === "circle" && styles.segmentButtonActive,
                ]}
                onPress={() => setShape("circle")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    shape === "circle" && styles.segmentTextActive,
                  ]}
                >
                  Circle
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.segmentButton,
                  shape === "rectangle" && styles.segmentButtonActive,
                ]}
                onPress={() => setShape("rectangle")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    shape === "rectangle" && styles.segmentTextActive,
                  ]}
                >
                  Rectangle
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.controlGroup}>
            <Text style={styles.label}>Pieces: {pieces}</Text>

            <Slider
              minimumValue={2}
              maximumValue={16}
              step={1}
              value={pieces}
              onValueChange={setPieces}
              minimumTrackTintColor="white"
              maximumTrackTintColor="rgba(255, 255, 255, 0.35)"
              thumbTintColor="white"
            />
          </View>

          <View style={styles.controlGroup}>
            <Text style={styles.label}>Size: {sizeScale.toFixed(1)}x</Text>

            <Slider
              minimumValue={0.5}
              maximumValue={1.5}
              step={0.1}
              value={sizeScale}
              onValueChange={setSizeScale}
              minimumTrackTintColor="white"
              maximumTrackTintColor="rgba(255, 255, 255, 0.35)"
              thumbTintColor="white"
            />
          </View>

          {shape === "rectangle" && (
            <Pressable
              style={styles.primaryButton}
              onPress={() =>
                setRectangleDirection((value) =>
                  value === "horizontal" ? "vertical" : "horizontal"
                )
              }
            >
              <Text style={styles.primaryButtonText}>Rotate rectangle</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <Pressable
          style={styles.showControlsButton}
          onPress={() => setControlsVisible(true)}
        >
          <Text style={styles.showControlsButtonText}>Controls</Text>
        </Pressable>
      )}
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
  controlsPanel: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 35,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    padding: 16,
    borderRadius: 18,
  },
  controlsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  controlsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 26,
    lineHeight: 28,
    fontWeight: "700",
  },
  controlGroup: {
    marginBottom: 12,
  },
  label: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 14,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  segmentButtonActive: {
    backgroundColor: "white",
  },
  segmentText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "black",
  },
  primaryButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "700",
  },
  showControlsButton: {
    position: "absolute",
    right: 20,
    bottom: 45,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderColor: "white",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  showControlsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});