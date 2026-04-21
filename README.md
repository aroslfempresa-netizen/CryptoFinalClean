# BrazaCripto - Exchange de Criptomoedas

Sistema completo de exchange de criptomoedas desenvolvido com HTML5, CSS3 e JavaScript puro.

## 🚀 Funcionalidades

### Sistema de Login
- Login com email e senha
- Registro com token de administrador
- Conta normal (ativa) e conta em análise
- Persistência via LocalStorage

### Dashboard
- Visão geral dos saldos (USDT, TRX, BTC)
- Gráfico animado de preços
- Alternância entre moedas e períodos
- Painel de administrador

### Carteira
- Endereços de depósito para cada moeda
- QR Code gerado dinamicamente
- Botão de copiar endereço

### Depósito
- Seleção de moeda
- Exibição de endereço e QR Code
- Confirmação automática
- Registro no histórico

### Saque
- Seleção de moeda e rede
- Cálculo de taxas
- Status pendente → confirmado (2 minutos)
- Validação de saldo

### Histórico
- Lista de transações
- Filtros (tipo, moeda, status)
- Detalhes expansíveis com hash e endereços

### Configurações
- **Perfil**: Alterar nome, email, senha, foto
- **Segurança**: 2FA, confirmação email/SMS, sessões
- **Limites**: Visualização de limites por nível
- **Preferências**: Tema, animações, moeda padrão
- **Notificações**: Controle de alertas

### Conta em Análise
- Bloqueio de funcionalidades
- Upload de documentos com progresso
- Simulação de envio e validação

## 🔐 Contas de Teste

### Conta Ativa
- **Email**: brazacriptos@gmail.com
- **Senha**: @Andre140
- **Saldo**: 315.023,52 USDT | 398.654,20 TRX

### Conta em Análise
- **Email**: marcos.silva@gmail.com
- **Senha**: @Marcos2026

### Conta Mestre (Administrador)
- **Email**: master@brazacripto.com
- **Senha**: @Master2026

### Token de Registro
- **Token**: BRAZACRIPTO2026

## 📁 Estrutura de Arquivos

```
├── index.html          (redireciona para login.html)
├── login.html          (tela de login e registro)
├── dashboard.html      (painel principal)
├── carteira.html       (endereços de depósito)
├── depositar.html      (realizar depósitos)
├── sacar.html          (realizar saques)
├── historico.html      (histórico de transações)
├── configuracoes.html  (configurações da conta)
├── analise.html        (página de conta em análise)
├── css/
│   └── style.css       (estilos gerais)
├── js/
│   └── app.js          (funções principais)
└── README.md
```

## 💾 Persistência

Todos os dados são salvos no LocalStorage:
- Usuários cadastrados
- Saldos das carteiras
- Histórico de transações
- Configurações da conta
- Status de uploads

## 🎨 Tecnologias

- HTML5
- CSS3 (Custom Properties, Flexbox, Grid, Animações)
- JavaScript Vanilla (ES6+)
- LocalStorage API
- Sem frameworks

## 🖥️ Como Usar

1. Abra o arquivo `login.html` no navegador
2. Faça login com uma das contas de teste
3. Ou registre-se com o token de administrador
4. Explore as funcionalidades do sistema

## 👨‍💼 Painel do Administrador

Ao fazer login com a conta mestre, o painel de administrador aparece no dashboard permitindo:
- Visualizar todos os usuários
- Ativar/desativar contas
- Colocar contas em análise

---

Desenvolvido com ❤️ para a BrazaCripto