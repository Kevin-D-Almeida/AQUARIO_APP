# Aquário Mobile

Aplicativo React Native com Expo para gerenciamento de aquários, equipamentos,
medições e lembretes de manutenção.

## Requisitos

- Node.js 20.19 ou superior
- Expo Go compatível com o SDK 54
- API NestJS e banco de dados em execução
- Celular e computador conectados à mesma rede

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env`.

3. Substitua o endereço pelo IP do computador que executa a API:

   ```env
   EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
   ```

   Não use `localhost` em um celular físico. O celular interpreta `localhost`
   como o próprio aparelho.

4. Inicie a API ouvindo em `0.0.0.0`.

5. Inicie o aplicativo:

   ```bash
   npx expo start --clear
   ```

6. Leia o QR Code usando o Expo Go.

## Funcionalidades do Beta

- cadastro, login, restauração e encerramento de sessão;
- armazenamento seguro do token;
- criação, consulta, edição e exclusão de aquários;
- criação, edição e exclusão de equipamentos;
- criação, edição e exclusão de medições manuais;
- criação de lembretes com calendário e equipamento opcional;
- definição de horário e repetição diária, semanal ou personalizada;
- notificações locais uma hora antes e no horário da atividade;
- aviso de preparo da água um dia antes de TPA e limpeza de filtro;
- reforços amigáveis para atividades que continuam pendentes;
- edição, conclusão e exclusão de lembretes;
- agenda geral com atualização por gesto;
- proteção das rotas autenticadas;
- mensagens de erro de rede e regras do backend.

## Verificações

```bash
npm run lint
npx tsc --noEmit
npx expo export --platform android
```

## Roteiro do teste interno

1. Cadastre uma nova conta.
2. Feche e abra o aplicativo para confirmar a restauração da sessão.
3. Crie um aquário e altere uma de suas dimensões.
4. Cadastre e edite um equipamento.
5. Cadastre e edite uma medição.
6. Crie um lembrete vinculado ao equipamento.
7. Edite e conclua o lembrete pela agenda.
8. Use “Testar notificação” na tela de perfil.
9. Confirme que concluir uma atividade recorrente cria a próxima ocorrência.
10. Confirme que um equipamento com lembrete não pode ser excluído.
11. Exclua o lembrete, a medição e o equipamento.
12. Exclua o aquário e encerre a sessão.

## Limite desta versão

O Beta usa medições manuais. O gerenciamento de dispositivos IoT ainda não
possui interface no aplicativo.

As notificações desta versão são locais e ficam agendadas no aparelho. No
Android, notificações remotas não funcionam no Expo Go a partir do SDK 53, mas
as notificações locais usadas pelo Aquário continuam disponíveis.
