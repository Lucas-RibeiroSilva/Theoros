// Studio.js serve apenas para personalizar o "npx prisma studio", que serve para melhor visualização do banco de dados

import { exec } from "child_process"

console.clear() // Limpa o terminal para exibir a mensagem personalizada de forma mais limpa
process.stdout.write('\x1Bc'); // Limpa o terminal de forma mais completa

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║ ████████╗██╗  ██╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗  ║
║ ╚══██╔══╝██║  ██║██╔════╝██╔═══██╗██╔══██╗██╔═══██╗██╔════╝  ║
║    ██║   ███████║█████╗  ██║   ██║██████╔╝██║   ██║███████╗  ║
║    ██║   ██╔══██║██╔══╝  ██║   ██║██╔══██╗██║   ██║╚════██║  ║
║    ██║   ██║  ██║███████╗╚██████╔╝██║  ██║╚██████╔╝███████║  ║
║    ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝  ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║                  ✦ ARQUIVOS DE THEOROS ✦                     ║
║                                                              ║
║  Os tomos proibidos foram desbloqueados.                     ║
║  Os registros ancestrais podem ser acessados.                ║
║                                                              ║
║  📚 Prisma Studio: http://localhost:5555                     ║
║                                                              ║
║  ⚔ Conexão com o banco estabelecida                          ║
║  🛡 Biblioteca arcana sincronizada                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`)

exec("npx prisma studio", (err) => {
  if (err) {
    console.error(err)
  }
})