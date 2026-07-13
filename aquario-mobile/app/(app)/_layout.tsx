import { Stack } from 'expo-router';

export default function AppLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="aquariums/index"
                options={{
                    title: 'Meus aquários',
                }}
            />

            <Stack.Screen
                name="aquariums/create"
                options={{
                    title: 'Novo aquário',
                }}
            />
        </Stack>
    );
}