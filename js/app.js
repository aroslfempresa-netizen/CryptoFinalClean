// ============================================
// BRAZACRIPTO - Sistema de Exchange
// Arquivo Principal de JavaScript
// ============================================

// Configurações
const CONFIG = {
    MASTER_EMAIL: 'master@brazacripto.com',
    MASTER_PASSWORD: '@Master2026',
    REGISTER_TOKEN: 'BRAZACRIPTO2026',
    STORAGE_KEYS: {
        USERS: 'brazacripto_users',
        CURRENT_USER: 'brazacripto_current_user',
        TRANSACTIONS: 'brazacripto_transactions',
        SETTINGS: 'brazacripto_settings'
    }
};

// Preços simulados atuais
const CRYPTO_PRICES = {
    USDT: { price: 5.12, change: 0.02 },
    TRX: { price: 0.82, change: -1.23 },
    BTC: { price: 342567.89, change: 2.45 }
};

// ============================================
// FUNÇÕES DE ARMAZENAMENTO
// ============================================

function getStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Erro ao ler storage:', e);
        return defaultValue;
    }
}

function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('Erro ao salvar storage:', e);
        return false;
    }
}

// ============================================
// SISTEMA DE USUÁRIOS
// ============================================

function initializeUsers() {
    let users = getStorage(CONFIG.STORAGE_KEYS.USERS, []);
    
    // Verificar se já existe o usuário padrão
    const defaultUser = users.find(u => u.email === 'brazacriptos@gmail.com');
    if (!defaultUser) {
        users.push({
            id: generateId(),
            email: 'brazacriptos@gmail.com',
            password: '@Andre140',
            name: 'Braza',
            status: 'active',
            isMaster: false,
            createdAt: new Date().toISOString(),
            balances: {
                USDT: 315023.52,
                TRX: 398654.20,
                BTC: 0.00
            },
            settings: {
                twoFactorEnabled: false,
                emailConfirmation: true,
                smsConfirmation: false,
                theme: 'dark',
                animations: true,
                defaultCurrency: 'BRL',
                notifications: {
                    deposit: true,
                    withdraw: true,
                    login: true,
                    security: true
                }
            }
        });
    }

    // Verificar se já existe o usuário em análise
    const analysisUser = users.find(u => u.email === 'marcos.silva@gmail.com');
    if (!analysisUser) {
        users.push({
            id: generateId(),
            email: 'marcos.silva@gmail.com',
            password: '@Marcos2026',
            name: 'Marcos Silva',
            status: 'analysis',
            isMaster: false,
            createdAt: new Date().toISOString(),
            balances: {
                USDT: 5000.00,
                TRX: 10000.00,
                BTC: 0.01
            },
            settings: {
                twoFactorEnabled: false,
                emailConfirmation: true,
                smsConfirmation: false,
                theme: 'dark',
                animations: true,
                defaultCurrency: 'BRL',
                notifications: {
                    deposit: true,
                    withdraw: true,
                    login: true,
                    security: true
                }
            }
        });
    }

    // Criar usuário mestre
    const masterUser = users.find(u => u.email === CONFIG.MASTER_EMAIL);
    if (!masterUser) {
        users.push({
            id: generateId(),
            email: CONFIG.MASTER_EMAIL,
            password: CONFIG.MASTER_PASSWORD,
            name: 'Administrador',
            status: 'active',
            isMaster: true,
            createdAt: new Date().toISOString(),
            balances: {
                USDT: 0,
                TRX: 0,
                BTC: 0
            },
            settings: {
                twoFactorEnabled: true,
                emailConfirmation: true,
                smsConfirmation: true,
                theme: 'dark',
                animations: true,
                defaultCurrency: 'BRL',
                notifications: {
                    deposit: true,
                    withdraw: true,
                    login: true,
                    security: true
                }
            }
        });
    }

    setStorage(CONFIG.STORAGE_KEYS.USERS, users);
    return users;
}

function getUsers() {
    return getStorage(CONFIG.STORAGE_KEYS.USERS, []);
}

function saveUsers(users) {
    setStorage(CONFIG.STORAGE_KEYS.USERS, users);
}

function findUserByEmail(email) {
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

function registerUser(email, password, name, token) {
    // Verificar token
    if (token !== CONFIG.REGISTER_TOKEN) {
        return { success: false, error: 'Token de registro inválido' };
    }

    // Verificar se email já existe
    if (findUserByEmail(email)) {
        return { success: false, error: 'Email já cadastrado' };
    }

    const users = getUsers();
    const newUser = {
        id: generateId(),
        email: email,
        password: password,
        name: name || email.split('@')[0],
        status: 'active',
        isMaster: false,
        createdAt: new Date().toISOString(),
        balances: {
            USDT: 0,
            TRX: 0,
            BTC: 0
        },
        settings: {
            twoFactorEnabled: false,
            emailConfirmation: true,
            smsConfirmation: false,
            theme: 'dark',
            animations: true,
            defaultCurrency: 'BRL',
            notifications: {
                deposit: true,
                withdraw: true,
                login: true,
                security: true
            }
        }
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true, user: newUser };
}

function loginUser(email, password) {
    const user = findUserByEmail(email);
    
    if (!user) {
        return { success: false, error: 'Email não encontrado' };
    }

    if (user.password !== password) {
        return { success: false, error: 'Senha incorreta' };
    }

    // Salvar usuário atual
    setStorage(CONFIG.STORAGE_KEYS.CURRENT_USER, user.id);

    return { success: true, user: user };
}

function getCurrentUser() {
    const userId = getStorage(CONFIG.STORAGE_KEYS.CURRENT_USER);
    if (!userId) return null;

    const users = getUsers();
    return users.find(u => u.id === userId);
}

function updateCurrentUser(updates) {
    const userId = getStorage(CONFIG.STORAGE_KEYS.CURRENT_USER);
    if (!userId) return false;

    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return false;

    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    return true;
}

function logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
    window.location.href = 'login.html';
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// ============================================
// SISTEMA MESTRE - Gerenciar Contas
// ============================================

function setUserStatus(email, status) {
    const users = getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (index === -1) return { success: false, error: 'Usuário não encontrado' };
    
    if (users[index].isMaster) {
        return { success: false, error: 'Não é possível alterar status do mestre' };
    }

    users[index].status = status;
    saveUsers(users);

    return { success: true };
}

function getAllUsers() {
    return getUsers().filter(u => !u.isMaster);
}

// ============================================
// SISTEMA DE TRANSAÇÕES
// ============================================

function getTransactions(userId = null) {
    const transactions = getStorage(CONFIG.STORAGE_KEYS.TRANSACTIONS, []);
    if (userId) {
        return transactions.filter(t => t.userId === userId);
    }
    return transactions;
}

function saveTransactions(transactions) {
    setStorage(CONFIG.STORAGE_KEYS.TRANSACTIONS, transactions);
}

function addTransaction(transaction) {
    const transactions = getTransactions();
    const newTransaction = {
        id: generateId(),
        hash: generateHash(),
        ...transaction,
        createdAt: new Date().toISOString()
    };
    transactions.unshift(newTransaction);
    saveTransactions(transactions);
    return newTransaction;
}

function updateTransactionStatus(transactionId, status) {
    const transactions = getTransactions();
    const index = transactions.findIndex(t => t.id === transactionId);
    
    if (index !== -1) {
        transactions[index].status = status;
        transactions[index].updatedAt = new Date().toISOString();
        saveTransactions(transactions);
        return true;
    }
    return false;
}

// ============================================
// FUNÇÕES DE SALDO
// ============================================

function updateBalance(coin, amount, operation = 'add') {
    const user = getCurrentUser();
    if (!user) return false;

    const users = getUsers();
    const index = users.findIndex(u => u.id === user.id);
    
    if (index === -1) return false;

    if (!users[index].balances) {
        users[index].balances = { USDT: 0, TRX: 0, BTC: 0 };
    }

    if (operation === 'add') {
        users[index].balances[coin] = (users[index].balances[coin] || 0) + amount;
    } else if (operation === 'subtract') {
        users[index].balances[coin] = Math.max(0, (users[index].balances[coin] || 0) - amount);
    }

    saveUsers(users);
    return true;
}

function getBalance(coin) {
    const user = getCurrentUser();
    if (!user || !user.balances) return 0;
    return user.balances[coin] || 0;
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

function generateId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function generateHash() {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
}

function formatCurrency(value, decimals = 2) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

function formatCrypto(value, decimals = 8) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals
    }).format(value);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function getRandomAddress(coin) {
    const addresses = {
        USDT: 'TLawgrKkiT3z4Z6993KLoLCQRhrxMvyNrP',
        TRX: 'TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS',
        BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
    };
    return addresses[coin] || addresses.USDT;
}

// ============================================
// SISTEMA DE NOTIFICAÇÕES
// ============================================

function showNotification(message, type = 'success') {
    // Remover notificação existente
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 20px;">${type === 'success' ? '✓' : '✕'}</span>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showLoading(show = true) {
    let overlay = document.querySelector('.loading-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(overlay);
    }

    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

// ============================================
// SISTEMA DE GRÁFICO
// ============================================

function generateChartData(points = 50, basePrice = 5.12) {
    const data = [];
    let price = basePrice;
    
    for (let i = 0; i < points; i++) {
        const change = (Math.random() - 0.5) * 0.1;
        price = Math.max(price + change, basePrice * 0.9);
        price = Math.min(price, basePrice * 1.1);
        data.push(price);
    }
    
    return data;
}

function drawChart(containerId, data, color = '#f7931a') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = 300;
    const padding = 40;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return { x, y, value };
    });

    const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    container.innerHTML = `
        <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
            <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:0.4" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
                </linearGradient>
            </defs>
            
            <!-- Grid lines -->
            ${[0, 1, 2, 3, 4].map(i => {
                const y = padding + (i / 4) * (height - padding * 2);
                const value = max - (i / 4) * range;
                return `
                    <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="rgba(255,255,255,0.1)" stroke-dasharray="4"/>
                    <text x="${padding - 10}" y="${y + 4}" fill="#6b7280" font-size="11" text-anchor="end">${formatCurrency(value, 4)}</text>
                `;
            }).join('')}
            
            <!-- Area -->
            <path class="chart-area" d="${areaD}" fill="url(#chartGradient)"/>
            
            <!-- Line -->
            <path class="chart-line" d="${pathD}" stroke="${color}"/>
            
            <!-- Dots -->
            ${points.map((p, i) => i % 5 === 0 ? `<circle class="chart-dot" cx="${p.x}" cy="${p.y}" r="4"/>` : '').join('')}
        </svg>
    `;
}

// ============================================
// SISTEMA DE QR CODE (Simplificado)
// ============================================

function generateQRCode(text, size = 200) {
    // QR Code simples usando canvas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Padrão simples de QR (simulado)
    ctx.fillStyle = '#000000';
    const cellSize = size / 25;
    
    // Gerar padrão baseado no texto
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
        seed += text.charCodeAt(i);
    }
    
    const random = (max) => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed % max;
    };
    
    // Padrões de canto (sempre presentes em QR)
    const drawCornerPattern = (x, y) => {
        ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
        ctx.fillStyle = '#000000';
        ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };
    
    drawCornerPattern(0, 0);
    drawCornerPattern(18, 0);
    drawCornerPattern(0, 18);
    
    // Dados simulados
    for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
            if ((i < 8 && j < 8) || (i < 8 && j > 16) || (i > 16 && j < 8)) continue;
            if (random(100) < 45) {
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
    
    return canvas.toDataURL();
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeUsers();
});

// Exportar funções para uso global
window.BrazaCrypto = {
    CONFIG,
    CRYPTO_PRICES,
    // Storage
    getStorage,
    setStorage,
    // Users
    getUsers,
    findUserByEmail,
    registerUser,
    loginUser,
    getCurrentUser,
    updateCurrentUser,
    logout,
    requireAuth,
    // Master
    setUserStatus,
    getAllUsers,
    // Transactions
    getTransactions,
    addTransaction,
    updateTransactionStatus,
    // Balance
    updateBalance,
    getBalance,
    // Utils
    generateId,
    generateHash,
    formatCurrency,
    formatCrypto,
    formatDate,
    getRandomAddress,
    // UI
    showNotification,
    showLoading,
    // Chart
    generateChartData,
    drawChart,
    // QR
    generateQRCode
};