import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import type { AquariumType } from '@/src/features/aquariums/model/aquarium.types';
import { useCreateAquariumViewModel } from '@/src/features/aquariums/view-model/use-create-aquarium-view-model';

const AQUARIUM_TYPES: {
    value: AquariumType;
    label: string;
}[] = [
        {
            value: 'FRESHWATER',
            label: 'Água doce',
        },
        {
            value: 'MARINE',
            label: 'Marinho',
        },
        {
            value: 'BRACKISH',
            label: 'Água salobra',
        },
        {
            value: 'PLANTED',
            label: 'Plantado',
        },
        {
            value: 'BLACKWATER',
            label: 'Águas negras',
        },
    ];

export default function CreateAquariumScreen() {
    const {
        name,
        type,
        widthCm,
        heightCm,
        depthCm,
        description,
        isSubmitting,
        errorMessage,

        setName,
        setType,
        setWidthCm,
        setHeightCm,
        setDepthCm,
        setDescription,
        handleSubmit,
    } = useCreateAquariumViewModel();

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={
                Platform.OS === 'ios' ? 'padding' : undefined
            }
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <View>
                    <Text style={styles.title}>Novo aquário</Text>

                    <Text style={styles.subtitle}>
                        Informe os dados principais do aquário.
                    </Text>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Nome</Text>

                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Ex.: Aquário Amazônico"
                        editable={!isSubmitting}
                        style={styles.input}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Tipo</Text>

                    <View style={styles.typeContainer}>
                        {AQUARIUM_TYPES.map((item) => {
                            const isSelected = item.value === type;

                            return (
                                <Pressable
                                    key={item.value}
                                    onPress={() => setType(item.value)}
                                    disabled={isSubmitting}
                                    style={[
                                        styles.typeButton,
                                        isSelected &&
                                        styles.typeButtonSelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            isSelected &&
                                            styles.typeButtonTextSelected,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>
                        Dimensões em centímetros
                    </Text>

                    <View style={styles.dimensionsContainer}>
                        <TextInput
                            value={widthCm}
                            onChangeText={setWidthCm}
                            placeholder="Largura"
                            keyboardType="decimal-pad"
                            editable={!isSubmitting}
                            style={[
                                styles.input,
                                styles.dimensionInput,
                            ]}
                        />

                        <TextInput
                            value={heightCm}
                            onChangeText={setHeightCm}
                            placeholder="Altura"
                            keyboardType="decimal-pad"
                            editable={!isSubmitting}
                            style={[
                                styles.input,
                                styles.dimensionInput,
                            ]}
                        />

                        <TextInput
                            value={depthCm}
                            onChangeText={setDepthCm}
                            placeholder="Profundidade"
                            keyboardType="decimal-pad"
                            editable={!isSubmitting}
                            style={[
                                styles.input,
                                styles.dimensionInput,
                            ]}
                        />
                    </View>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>
                        Descrição opcional
                    </Text>

                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Descreva brevemente o aquário"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        editable={!isSubmitting}
                        style={[
                            styles.input,
                            styles.descriptionInput,
                        ]}
                    />
                </View>

                {errorMessage && (
                    <Text style={styles.errorText}>
                        {errorMessage}
                    </Text>
                )}

                <Pressable
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    style={[
                        styles.submitButton,
                        isSubmitting &&
                        styles.submitButtonDisabled,
                    ]}
                >
                    {isSubmitting ? (
                        <ActivityIndicator />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            Cadastrar aquário
                        </Text>
                    )}
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        padding: 24,
        gap: 24,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
    },

    subtitle: {
        marginTop: 6,
        fontSize: 15,
        opacity: 0.7,
    },

    field: {
        gap: 8,
    },

    label: {
        fontSize: 15,
        fontWeight: '600',
    },

    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 16,
    },

    dimensionsContainer: {
        flexDirection: 'row',
        gap: 8,
    },

    dimensionInput: {
        flex: 1,
    },

    descriptionInput: {
        minHeight: 110,
    },

    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    typeButton: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 9,
    },

    typeButtonSelected: {
        backgroundColor: '#222',
    },

    typeButtonText: {
        fontSize: 14,
    },

    typeButtonTextSelected: {
        color: '#fff',
    },

    errorText: {
        fontSize: 14,
        color: '#b00020',
    },

    submitButton: {
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        backgroundColor: '#222',
    },

    submitButtonDisabled: {
        opacity: 0.6,
    },

    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});