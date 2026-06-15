const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Conexão com o banco de dados em arquivo local
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error('Erro ao conectar ao banco:', err.message);
    else console.log('Banco de dados SQLite3 conectado.');
});

// Criação da tabela de produtos
db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco REAL NOT NULL
)`);

// Layout Base HTML (Wrapper para manter a identidade visual em todas as páginas)
const layoutDashboard = (conteudo) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Express + SQLite3</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-900 text-slate-100 font-sans min-h-screen flex flex-col items-center justify-start p-6 md:p-12">
    <div class="w-full max-w-4xl bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700/50">
        <header class="mb-8 border-b border-slate-700 pb-6 text-center md:text-left">
            <h1 class="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Database Control Panel
            </h1>
            <p class="text-slate-400 text-sm mt-2">Desafio Express + SQLite3 - Versão 2.0 Pro</p>
        </header>
        <main>
            ${conteudo}
        </main>
    </div>
</body>
</html>
`;

// ROTA 1: Página Principal
app.get('/', (req, res) => {
    db.all("SELECT * FROM produtos", [], (err, rows) => {
        if (err) return res.status(500).send("Erro no banco de dados.");

        let tabelaHtml = '';
        if (rows.length === 0) {
            tabelaHtml = `
                <div class="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                    <p class="text-slate-400 text-lg font-medium text-center">O banco de dados está completamente vazio.</p>
                    <p class="text-slate-500 text-sm mt-1 text-center">Utilize os botões de ação acima para injetar novos registros.</p>
                </div>`;
        } else {
            tabelaHtml = `
                <div class="overflow-x-auto rounded-xl border border-slate-700 bg-slate-950/40">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-800 border-b border-slate-700 text-slate-300 font-semibold text-sm">
                                <th class="p-4 w-20 text-center">ID</th>
                                <th class="p-4">Produto</th>
                                <th class="p-4 text-right">Preço</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800 text-slate-300 text-sm">
                            ${rows.map(item => `
                                <tr class="hover:bg-slate-800/40 transition-colors">
                                    <td class="p-4 text-center font-mono text-cyan-400 bg-slate-900/20">#${item.id}</td>
                                    <td class="p-4 font-medium">${item.nome}</td>
                                    <td class="p-4 text-right font-mono text-emerald-400 font-semibold">R$ ${item.preco.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="mt-4 text-right">
                    <span class="text-xs font-semibold bg-slate-700/50 text-slate-400 px-3 py-1.5 rounded-full border border-slate-600/30">
                        Total de registros: ${rows.length}
                    </span>
                </div>`;
        }

        const corpoPrincipal = `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <a href="/popular-poucos" class="group flex items-center justify-center p-4 bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-900/20 transition-all duration-200 transform hover:-translate-y-0.5 text-center">
                    <span>⚡ Popular Poucos</span>
                </a>
                <a href="/popular-muitos" class="group flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/20 transition-all duration-200 transform hover:-translate-y-0.5 text-center">
                    <span>🚀 Popular Muitos (Lote)</span>
                </a>
                <a href="/limpar-banco" class="group flex items-center justify-center p-4 bg-gradient-to-br from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-rose-900/20 transition-all duration-200 transform hover:-translate-y-0.5 text-center">
                    <span>🗑️ Limpar Banco</span>
                </a>
            </div>
            
            <div class="space-y-4">
                <h2 class="text-xl font-bold text-slate-200 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Dados Armazenados (SQLite3)
                </h2>
                ${tabelaHtml}
            </div>
        `;

        res.send(layoutDashboard(corpoPrincipal));
    });
});

// ROTA 2: Popular Poucos Registros
app.get('/popular-poucos', (req, res) => {
    const stmt = db.prepare("INSERT INTO produtos (nome, preco) VALUES (?, ?)");
    stmt.run("Caderno Universitário", 19.90);
    stmt.run("Caneta Esferográfica", 2.50);
    stmt.finalize();

    const telaSucesso = `
        <div class="text-center py-8 space-y-6">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 text-3xl mb-2">
                ⚡
            </div>
            <h2 class="text-2xl font-bold text-cyan-400">Inserção Rápida Concluída!</h2>
            <p class="text-slate-400 max-w-md mx-auto">
                Foram semeados com sucesso <span class="text-slate-200 font-semibold">2 produtos padrão</span> diretamente no arquivo físico do SQLite3.
            </p>
            <div class="pt-4">
                <a href="/" class="inline-block bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium px-6 py-2.5 rounded-xl transition-colors border border-slate-600">
                    ← Voltar para a Dashboard
                </a>
            </div>
        </div>
    `;
    res.send(layoutDashboard(telaSucesso));
});

// ROTA 3: Popular Muitos Registros (Em lote)
app.get('/popular-muitos', (req, res) => {
    const stmt = db.prepare("INSERT INTO produtos (nome, preco) VALUES (?, ?)");
    for (let i = 1; i <= 15; i++) {
        stmt.run(`Inserção automatizada de produto ${String.fromCharCode(64 + i)}`, 12.50 * i);
    }
    stmt.finalize();

    const telaSucessoMuitos = `
        <div class="text-center py-8 space-y-6">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 text-3xl mb-2">
                🚀
            </div>
            <h2 class="text-2xl font-bold text-indigo-400">Carga em Lote Finalizada!</h2>
            <p class="text-slate-400 max-w-md mx-auto">
                Um laço de repetição inseriu eficientemente <span class="text-slate-200 font-semibold">15 novos registros customizados</span> no banco de dados.
            </p>
            <div class="pt-4">
                <a href="/" class="inline-block bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium px-6 py-2.5 rounded-xl transition-colors border border-slate-600">
                    ← Voltar para a Dashboard
                </a>
            </div>
        </div>
    `;
    res.send(layoutDashboard(telaSucessoMuitos));
});

// ROTA AUXILIAR: Limpar Banco
app.get('/limpar-banco', (req, res) => {
    db.run("DELETE FROM produtos", [], (err) => {
        if (err) return res.status(500).send("Erro ao limpar a tabela.");
        res.redirect('/');
    });
});

// Inicialização do Servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});