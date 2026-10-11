import { Ionicons } from "@expo/vector-icons";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  removeProfileAvatar,
  resolveAvatarUrl,
  uploadProfileAvatar,
} from "@/src/features/auth/services/profile-avatar.service";
import { useAuth } from "@/src/providers/auth-provider";
import { Card, PrimaryButton, ScreenHeader } from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";
import { getErrorMessage } from "@/src/shared/utils/error-message";
import { showSuccess } from "@/src/shared/utils/feedback";

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const [avatarBusy, setAvatarBusy] = useState(false);
  const avatarUrl = resolveAvatarUrl(user?.avatarUrl);

  async function selectAvatar() {
    if (avatarBusy) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso às fotos para escolher uma imagem de perfil.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    try {
      setAvatarBusy(true);
      const compressed = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 720, height: 720 } }],
        { compress: 0.75, format: SaveFormat.JPEG },
      );
      const updatedUser = await uploadProfileAvatar(compressed.uri);
      updateUser(updatedUser);
      showSuccess("Foto de perfil atualizada.");
    } catch (error) {
      Alert.alert(
        "Não foi possível atualizar a foto",
        getErrorMessage(error, "Escolha outra imagem e tente novamente."),
      );
    } finally {
      setAvatarBusy(false);
    }
  }

  function confirmRemoveAvatar() {
    if (avatarBusy) return;
    Alert.alert(
      "Remover foto?",
      "A inicial do seu nome voltará a ser exibida.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => void removeAvatar(),
        },
      ],
    );
  }

  async function removeAvatar() {
    try {
      setAvatarBusy(true);
      const updatedUser = await removeProfileAvatar();
      updateUser(updatedUser);
      showSuccess("Foto de perfil removida.");
    } catch (error) {
      Alert.alert(
        "Não foi possível remover a foto",
        getErrorMessage(error, "Tente novamente."),
      );
    } finally {
      setAvatarBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          eyebrow="CONTA"
          title="Seu perfil"
          subtitle="Sessão protegida no dispositivo com SecureStore."
        />
        <Card style={styles.profile}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Alterar foto de perfil"
            disabled={avatarBusy}
            onPress={() => void selectAvatar()}
            style={styles.avatarContainer}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {user?.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              {avatarBusy ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={17} color="#fff" />
              )}
            </View>
          </Pressable>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.avatarActions}>
            <Pressable
              disabled={avatarBusy}
              onPress={() => void selectAvatar()}
              style={styles.avatarAction}
            >
              <Text style={styles.avatarActionText}>
                {avatarUrl ? "Alterar foto" : "Adicionar foto"}
              </Text>
            </Pressable>
            {avatarUrl ? (
              <Pressable
                disabled={avatarBusy}
                onPress={confirmRemoveAvatar}
                style={styles.removeAction}
              >
                <Text style={styles.removeActionText}>Remover</Text>
              </Pressable>
            ) : null}
          </View>
        </Card>
        <Card style={styles.info}>
          <Ionicons
            name="shield-checkmark-outline"
            size={25}
            color={theme.colors.success}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Sessão segura</Text>
            <Text style={styles.infoText}>
              Seu token é armazenado no mecanismo seguro do sistema.
            </Text>
          </View>
        </Card>
        <Card style={styles.info}>
          <Ionicons
            name="notifications-outline"
            size={25}
            color={theme.colors.primary}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Lembretes nativos</Text>
            <Text style={styles.infoText}>
              Receba avisos antecipados e reforços para atividades pendentes.
            </Text>
          </View>
        </Card>
        <PrimaryButton
          title="Sair da conta"
          variant="danger"
          onPress={() =>
            Alert.alert(
              "Sair da conta?",
              "Você precisará entrar novamente para acessar seus aquários.",
              [
                { text: "Cancelar" },
                { text: "Sair", style: "destructive", onPress: signOut },
              ],
            )
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 22, paddingBottom: 110, gap: 16 },
  profile: { alignItems: "center", paddingVertical: 28 },
  avatarContainer: { width: 96, height: 96, marginBottom: 14 },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 38, fontWeight: "900" },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primaryDark,
    borderWidth: 3,
    borderColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { color: theme.colors.text, fontSize: 22, fontWeight: "900" },
  email: { color: theme.colors.muted, marginTop: 5 },
  avatarActions: { flexDirection: "row", gap: 10, marginTop: 18 },
  avatarAction: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatarActionText: { color: theme.colors.primaryDark, fontWeight: "800" },
  removeAction: {
    borderRadius: theme.radius.pill,
    backgroundColor: "#FDECEC",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  removeActionText: { color: theme.colors.danger, fontWeight: "800" },
  info: { flexDirection: "row", gap: 12, alignItems: "center" },
  infoContent: { flex: 1 },
  infoTitle: { color: theme.colors.text, fontWeight: "800" },
  infoText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
});
