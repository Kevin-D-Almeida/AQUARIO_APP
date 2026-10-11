# Roteiro de testes internos — Beta

Registre o modelo do celular, versão do Android/iOS, versão do app, data e nome do testador. Para cada cenário, marque `Aprovado`, `Reprovado` ou `Não testado` e descreva como reproduzir qualquer falha.

## Preparação

- [ ] Celular e computador estão na mesma rede.
- [ ] API está ligada e acessível pelo navegador do celular.
- [ ] `EXPO_PUBLIC_API_URL` aponta para o IP correto do computador.
- [ ] Permissão de notificações foi concedida.

## Conta e sessão

- [ ] Criar uma conta com dados válidos.
- [ ] Tentar cadastrar novamente o mesmo e-mail e conferir a mensagem.
- [ ] Tentar cadastrar senhas diferentes e senha curta.
- [ ] Entrar com usuário e senha válidos.
- [ ] Tentar entrar com senha incorreta.
- [ ] Fechar e reabrir o app e confirmar que a sessão permanece.
- [ ] Sair da conta e confirmar o retorno ao login.
- [ ] Adicionar uma foto de perfil pela galeria.
- [ ] Fechar e reabrir o app e confirmar que a foto permanece.
- [ ] Alterar a foto e confirmar que a nova imagem substitui a anterior.
- [ ] Remover a foto e confirmar que a inicial do nome volta a aparecer.
- [ ] Negar a permissão da galeria e conferir a mensagem apresentada.

## Aquários

- [ ] Cadastrar um aquário e conferir o aviso de sucesso.
- [ ] Tocar várias vezes rapidamente em cadastrar e confirmar que só um registro foi criado.
- [ ] Conferir o cálculo do volume.
- [ ] Editar nome, descrição e dimensões.
- [ ] Confirmar que campos obrigatórios e números inválidos exibem mensagens claras.

## Equipamentos

- [ ] Cadastrar um equipamento com e sem marca/modelo.
- [ ] Cadastrar um intervalo de manutenção válido.
- [ ] Tentar usar intervalo zero, negativo ou decimal.
- [ ] Editar o equipamento.
- [ ] Excluir um equipamento sem lembrete associado.
- [ ] Tentar excluir um equipamento associado a um lembrete e conferir a mensagem.

## Medições

- [ ] Registrar cada tipo de medição disponível.
- [ ] Confirmar que vírgula e ponto funcionam em valores decimais.
- [ ] Editar uma medição.
- [ ] Excluir uma medição.
- [ ] Confirmar que a lista exibe primeiro as medições recentes.

## Lembretes e recorrência

- [ ] Criar lembrete sem recorrência.
- [ ] Criar recorrência diária, semanal e personalizada.
- [ ] Associar um lembrete a um equipamento do mesmo aquário.
- [ ] Confirmar a ordem dos campos: data antes da hora.
- [ ] Editar data, hora, recorrência e equipamento.
- [ ] Confirmar que atividade futura não pode ser concluída.
- [ ] Confirmar que atividade atrasada mostra `Reagendar`.
- [ ] Reagendar uma atividade atrasada pelo botão da agenda.
- [ ] Confirmar que uma atividade só pode ser concluída no dia agendado, independentemente da hora.
- [ ] Concluir uma atividade recorrente e confirmar a criação da próxima ocorrência.
- [ ] Abrir o histórico e conferir a atividade concluída.

## Notificações

- [ ] Conferir lembrete uma hora antes da atividade.
- [ ] Conferir aviso de preparação de água um dia antes de TPA e limpeza de filtro.
- [ ] Conferir os lembretes posteriores quando a atividade permanece pendente.
- [ ] Editar ou excluir o lembrete e confirmar que notificações antigas não aparecem.

## Falhas e recuperação

- [ ] Desligar a API e confirmar a mensagem de servidor indisponível.
- [ ] Desligar o Wi-Fi do celular e confirmar a mensagem de conexão.
- [ ] Ligar novamente a rede/API e usar `Tentar novamente`.
- [ ] Confirmar que uma sessão expirada retorna ao login.
- [ ] Em telas de gravação, tocar rapidamente várias vezes e confirmar que não há duplicação.

## Critério de aprovação

O Beta pode ser distribuído internamente quando não houver falhas que impeçam cadastro, login, criação de aquário, equipamentos, medições, lembretes, conclusão ou notificações. Falhas visuais pequenas podem ser registradas para a próxima versão, desde que não causem perda ou duplicação de dados.
