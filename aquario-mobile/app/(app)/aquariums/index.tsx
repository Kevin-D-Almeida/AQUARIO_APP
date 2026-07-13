import {
    ActivityIndicator,
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import type { Aquarium } from '@/src/features/aquariums/model/aquarium.types';
import { useAquariumsViewModel } from '@/src/features/aquariums/view-model/use-aquariums-view-model';
import { router } from 'expo-router';

export default function AquariumsScreen() {
    const {
        aquariums,
        isLoading,
        isError,
        refresh,
        isRefreshing,
    } = useAquariumsViewModel();

    if (isLoading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.feedbackText}>
                    Carregando aquários...
                </Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorTitle}>
                    Não foi possível carregar os aquários
                </Text>

                <Pressable style={styles.retryButton} onPress={() => refresh()}>
                    <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={aquariums}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={[
                    styles.listContent,
                    aquariums.length === 0 && styles.emptyListContent,
                ]}
                refreshing={isRefreshing}
                onRefresh={refresh}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.title}>Meus aquários</Text>

                            <Text style={styles.subtitle}>
                                Acompanhe seus aquários em um só lugar
                            </Text>
                        </View>

                        <Pressable
                            style={styles.createButton}
                            onPress={() =>
                                router.navigate('/aquariums/create')
                            }
                        >
                            <Text style={styles.createButtonText}>
                                + Novo
                            </Text>
                        </Pressable>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>
                            Nenhum aquário cadastrado
                        </Text>

                        <Text style={styles.emptyMessage}>
                            Cadastre seu primeiro aquário para começar.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => <AquariumCard aquarium={item} />}
            />
        </SafeAreaView>
    );
}

type AquariumCardProps = {
    aquarium: Aquarium;
};

function AquariumCard({ aquarium }: AquariumCardProps) {
    return (
        <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>{aquarium.name}</Text>

            <Text style={styles.cardDetails}>
                {formatAquariumType(aquarium.type)} •{' '}
                {aquarium.volumeLiters.toFixed(1)} L
            </Text>

            <Text style={styles.cardDimensions}>
                {aquarium.widthCm} × {aquarium.heightCm} ×{' '}
                {aquarium.depthCm} cm
            </Text>
        </Pressable>
    );
}

function formatAquariumType(type: Aquarium['type']): string {
    const labels: Record<Aquarium['type'], string> = {
        FRESHWATER: 'Água doce',
        MARINE: 'Marinho',
        BRACKISH: 'Água salobra',
        PLANTED: 'Plantado',
        BLACKWATER: 'Águas negras',
    };

    return labels[type];
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    listContent: {
        padding: 24,
        gap: 16,
    },

    emptyListContent: {
        flexGrow: 1,
    },

    header: {
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },

    headerText: {
        flex: 1,
    },

    createButton: {
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: '#222',
    },

    createButtonText: {
        color: '#fff',
        fontWeight: '600',
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

    card: {
        padding: 18,
        borderWidth: 1,
        borderRadius: 12,
    },

    cardTitle: {
        fontSize: 19,
        fontWeight: '700',
    },

    cardDetails: {
        marginTop: 8,
        fontSize: 15,
    },

    cardDimensions: {
        marginTop: 6,
        fontSize: 13,
        opacity: 0.65,
    },

    centeredContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 16,
    },

    feedbackText: {
        fontSize: 15,
    },

    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },

    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#222',
    },

    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },

    emptyMessage: {
        marginTop: 8,
        fontSize: 15,
        textAlign: 'center',
        opacity: 0.7,
    },
});