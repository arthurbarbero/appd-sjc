/*
  Encerra `wrangler dev` e `workerd` que ficaram de execuções anteriores.

  Por que existe: no Windows, um `wrangler dev` ainda vivo mantém aberta a pasta
  `.output/public`, e o build seguinte falha com

      EBUSY: resource busy or locked, rmdir '...\.output\public'

  A mensagem não diz o que fazer, e quem a recebe não tem como adivinhar que precisa
  encerrar um processo invisível — em geral sobrou de um terminal fechado no X.

  **Matar só o `workerd` não resolve**, e essa foi a pegadinha: o `wrangler` é supervisor
  e relança o runtime em segundos, com PID novo. Some um, nasce outro, e a impressão é de
  que o comando não funciona. Por isso aqui o alvo é o processo `node` do wrangler
  primeiro, e o `workerd` depois.

  É seguro: encerra apenas processos cuja linha de comando contém `wrangler`, mais o
  runtime `workerd`. Não toca no resto. Sem nada para encerrar, não faz nada e não reclama.
*/

import { execFileSync } from 'node:child_process'

function silencioso(comando, argumentos) {
  try {
    execFileSync(comando, argumentos, { stdio: 'ignore' })
    return true
  } catch {
    // Nenhum processo correspondente é o caso normal, não erro.
    return false
  }
}

if (process.platform === 'win32') {
  // Primeiro o supervisor, senão ele relança o runtime que acabamos de encerrar.
  silencioso('powershell', [
    '-NoProfile',
    '-Command',
    'Get-CimInstance Win32_Process -Filter "Name=\'node.exe\'" | ' +
      "Where-Object { $_.CommandLine -like '*wrangler*' } | " +
      'ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }',
  ])
  silencioso('taskkill', ['/F', '/IM', 'workerd.exe'])
} else {
  silencioso('pkill', ['-f', 'wrangler'])
  silencioso('pkill', ['-f', 'workerd'])
}

// O Windows leva um instante para soltar os arquivos depois que o processo morre.
await new Promise((resolve) => setTimeout(resolve, 1500))
