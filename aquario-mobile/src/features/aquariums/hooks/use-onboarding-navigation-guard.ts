import { useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, BackHandler } from "react-native";

export function useOnboardingNavigationGuard(active: boolean) {
  const navigation = useNavigation<{
    addListener: (
      event: "beforeRemove",
      listener: (event: { preventDefault: () => void }) => void,
    ) => () => void;
  }>();
  const [isLeaving, setIsLeaving] = useState(false);
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (!active || isLeaving) return;

    return navigation.addListener("beforeRemove", (event) => {
      if (isLeavingRef.current) return;
      event.preventDefault();
      Alert.alert(
        "Continue seu tutorial",
        "Conclua esta etapa ou use “Pular etapa” quando essa opção estiver disponível.",
      );
    });
  }, [active, isLeaving, navigation]);

  useEffect(() => {
    if (!active || isLeaving) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isLeavingRef.current) return false;
        Alert.alert(
          "Continue seu tutorial",
          "Conclua esta etapa ou use “Pular etapa” quando essa opção estiver disponível.",
        );
        return true;
      },
    );

    return () => subscription.remove();
  }, [active, isLeaving]);

  return function allowOnboardingNavigation() {
    isLeavingRef.current = true;
    setIsLeaving(true);
  };
}
