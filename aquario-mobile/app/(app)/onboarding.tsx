import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    completeAquariumOnboarding,
    startAquariumOnboarding,
} from "@/src/features/aquariums/services/aquarium-onboarding.service";
import { useAuth } from "@/src/providers/auth-provider";
import { PrimaryButton } from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";

const gettingStartedSteps = [
    {
        icon: "resize-outline" as const,
        title: "Registre o aquário",
        description:
            "Identifique o sistema e informe as dimensões para estimar o volume.",
    },
    {
        icon: "construct-outline" as const,
        title: "Cadastre um equipamento",
        description: "Registre filtro, aquecedor ou outro item do setup.",
    },
    {
        icon: "calendar-outline" as const,
        title: "Programe um lembrete",
        description: "Escolha uma tarefa e quando você quer ser lembrado.",
    },
    {
        icon: "flask-outline" as const,
        title: "Registre uma medição",
        description: "Guarde um parâmetro inicial para comparar no futuro.",
    },
];

export default function AquariumOnboardingScreen() {
    const { user } = useAuth();
    const [busy, setBusy] = useState(false);

    async function startAquariumSetup() {
        if (busy || !user) return;
        setBusy(true);
        try {
            await startAquariumOnboarding(user.id);
            router.push({
                pathname: "/aquariums/create",
                params: { onboarding: "true" },
            });
        } finally {
            setBusy(false);
        }
    }

    async function skipOnboarding() {
        if (busy || !user) return;
        setBusy(true);
        try {
            await completeAquariumOnboarding(user.id);
            router.replace({
                pathname: "/aquariums",
                params: { onboardingComplete: "true" },
            });
        } finally {
            setBusy(false);
        }
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.hero}>
                    <View style={styles.watermark}>
                        <Ionicons name="water" size={34} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.eyebrow}>TUTORIAL INICIAL</Text>
                    <Text style={styles.title}>Vamos montar sua rotina.</Text>
                    <Text style={styles.subtitle}>
                        Em quatro etapas, você configura o aquário e aprende onde
                        registrar os cuidados. As etapas de equipamento, lembrete e
                        medição podem ser puladas.
                    </Text>
                </View>

                <View style={styles.steps}>
                    {gettingStartedSteps.map((step, index) => (
                        <View key={step.title} style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>{index + 1}</Text>
                            </View>
                            <View style={styles.stepIcon}>
                                <Ionicons
                                    name={step.icon}
                                    size={21}
                                    color={theme.colors.primaryDark}
                                />
                            </View>
                            <View style={styles.stepCopy}>
                                <Text style={styles.stepTitle}>{step.title}</Text>
                                <Text style={styles.stepDescription}>{step.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.note}>
                    <Ionicons
                        name="information-circle-outline"
                        size={21}
                        color={theme.colors.warning}
                    />
                    <Text style={styles.noteText}>
                        O volume calculado pelas dimensões é uma estimativa. Substrato,
                        decoração e nível da água reduzem o volume real.
                    </Text>
                </View>

                <PrimaryButton
                    title={busy ? "Abrindo cadastro..." : "Cadastrar meu primeiro aquário"}
                    onPress={() => void startAquariumSetup()}
                    disabled={busy}
                />
                {busy ? (
                    <ActivityIndicator color={theme.colors.primary} />
                ) : (
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => void skipOnboarding()}
                        style={styles.skipButton}
                    >
                        <Text style={styles.skipText}>Explorar sem cadastrar agora</Text>
                    </Pressable>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    content: { flexGrow: 1, padding: 24, paddingBottom: 36, gap: 24 },
    hero: { paddingTop: 18, gap: 10 },
    watermark: {
        width: 66,
        height: 66,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 22,
        backgroundColor: theme.colors.primarySoft,
        marginBottom: 8,
    },
    eyebrow: {
        color: theme.colors.primaryDark,
        fontWeight: "900",
        fontSize: 12,
    },
    title: {
        color: theme.colors.text,
        fontSize: 30,
        lineHeight: 36,
        fontWeight: "900",
    },
    subtitle: { color: theme.colors.muted, fontSize: 15, lineHeight: 22 },
    steps: { gap: 18, paddingVertical: 2 },
    step: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    stepNumber: {
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: theme.colors.text,
        marginTop: 4,
    },
    stepNumberText: { color: "#fff", fontSize: 12, fontWeight: "900" },
    stepIcon: {
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.primarySoft,
    },
    stepCopy: { flex: 1, gap: 3 },
    stepTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "800" },
    stepDescription: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 },
    note: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 9,
        padding: 13,
        backgroundColor: "#FFF5D9",
        borderRadius: theme.radius.sm,
    },
    noteText: { flex: 1, color: theme.colors.text, fontSize: 12, lineHeight: 18 },
    skipButton: { minHeight: 42, alignItems: "center", justifyContent: "center" },
    skipText: { color: theme.colors.muted, fontWeight: "700" },
});
