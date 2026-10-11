import { Alert, Platform, ToastAndroid } from "react-native";

export function showSuccess(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert("Tudo certo", message);
}
