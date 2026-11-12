import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AquariumOnboardingStep } from "../services/aquarium-onboarding.service";
import { theme } from "@/src/shared/theme/theme";

const stepContent: Record<
    AquariumOnboardingStep,
    { number: number; title: string; description: string }
> = {
    aquarium: {
        number: 1,
        title: "Identifique seu aquário",
        description:
            "Esses dados organizam o ecossistema e ajudam a estimar seu volume.",
    },
    equipment: {
        number: 2,
        title: "Registre um equipamento",
        description:
            "Comece pelo filtro ou pelo item que você mais precisa acompanhar.",
    },
    reminder: {
        number: 3,
        title: "Planeje um cuidado",
        description:
            "Escolha uma tarefa futura para criar sua primeira rotina de manutenção.",
    },
    measurement: {
        number: 4,
        title: "Registre um parâmetro",
        description:
            "Uma medição inicial serve como referência para acompanhar mudanças.",
    },
};

export function OnboardingStepGuide({
    step,
    onSkip,
}: {
    step: AquariumOnboardingStep;
    onSkip?: () => void;
}) {
    const content = stepContent[step];

    return (
        <View style={styles.guide}>
            <View style={styles.guideTop}>
                <Text style={styles.progress}>ETAPA {content.number} DE 4</Text>
                {onSkip ? (
                    <Pressable
                        accessibilityRole="button"
                        onPress={onSkip}
                        style={styles.skipButton}
                    >
                        <Text style={styles.skipText}>Pular etapa</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={15}
                            color={theme.colors.primaryDark}
                        />
                    </Pressable>
                ) : null}
            </View>
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.description}>{content.description}</Text>
            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${content.number * 25}%` },
                    ]}
                />
            </View>
        </View>
    );
}

export function FieldHint({ children }: { children: string }) {
    return <Text style={styles.fieldHint}>{children}</Text>;
}

const styles = StyleSheet.create({
    guide: {
        gap: 6,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    guideTop: {
        minHeight: 28,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    progress: {
        color: theme.colors.primaryDark,
        fontSize: 11,
        fontWeight: "900",
    },
    skipButton: {
        minHeight: 36,
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingHorizontal: 4,
    },
    skipText: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: "800" },
    title: { color: theme.colors.text, fontSize: 17, fontWeight: "900" },
    description: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 },
    progressTrack: {
        height: 4,
        overflow: "hidden",
        borderRadius: 2,
        backgroundColor: theme.colors.border,
        marginTop: 7,
    },
    progressFill: { height: 4, borderRadius: 2, backgroundColor: theme.colors.primary },
    fieldHint: { color: theme.colors.muted, fontSize: 12, lineHeight: 17 },
});
