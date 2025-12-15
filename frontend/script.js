let dadosOcorrencias = [];

let chartRosca = null;
let chartLinha = null;
let chartModelo = null;

const paletaGradiente = [
  '#b22222', '#c0392b', '#e74c3c',
  '#d35400', '#e67e22', '#f39c12'
];

// ============================
// FILTRO POR DATA
// ============================
function filtrarPorData(lista) {
  const inicio = document.getElementById('dataInicio').value;
  const fim = document.getElementById('dataFim').value;

  return lista.filter(o => {
    if (!o.data_hora) return false;

    const data = new Date(o.data_hora);
    const dataInicio = inicio ? new Date(inicio) : null;
    const dataFim = fim ? new Date(fim) : null;

    return (!dataInicio || data >= dataInicio) &&
           (!dataFim || data <= dataFim);
  });
}

// ============================
// CONTAGEM CATEGÓRICA
// ============================
function contarOcorrencias(lista, campo) {
  const contagem = {};

  lista.forEach(o => {
    const valor = o[campo];
    if (valor !== undefined && valor !== null) {
      contagem[valor] = (contagem[valor] || 0) + 1;
    }
  });

  return contagem;
}

// ============================
// GRÁFICO ROSCA
// ============================
function atualizarGraficoRosca(campo) {
  const filtrados = filtrarPorData(dadosOcorrencias);
  const contagem = contarOcorrencias(filtrados, campo);

  const labels = Object.keys(contagem);
  const valores = Object.values(contagem);

  const cores = labels.map((_, i) =>
    paletaGradiente[i % paletaGradiente.length]
  );

  if (chartRosca) chartRosca.destroy();

  const ctx = document.getElementById('graficoRosca').getContext('2d');

  chartRosca = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: cores
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right' }
      }
    }
  });
}

// ============================
// GRÁFICO TEMPORAL (LINHA)
// ============================
function atualizarGraficoLinha() {
  const filtrados = filtrarPorData(dadosOcorrencias);
  const mapaDatas = {};

  filtrados.forEach(o => {
    const data = o.data_hora.split('T')[0];
    mapaDatas[data] = (mapaDatas[data] || 0) + 1;
  });

  const labels = Object.keys(mapaDatas).sort();
  const valores = labels.map(d => mapaDatas[d]);

  if (chartLinha) chartLinha.destroy();

  const ctx = document.getElementById('graficoLinha').getContext('2d');

  chartLinha = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Ocorrências',
        data: valores,
        borderColor: '#b22222',
        backgroundColor: 'rgba(178,34,34,0.2)',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// ============================
// "MODELO" — PRECISÃO GPS x TIPO
// (simples para a disciplina)
// ============================
function atualizarGraficoModelo() {
  const filtrados = filtrarPorData(dadosOcorrencias);

  const tipos = [...new Set(filtrados.map(o => o.tipo_ocorrencia))];
  const tipoParaY = {};
  tipos.forEach((t, i) => tipoParaY[t] = i + 1);

  const datasets = tipos.map(tipo => {
    const pontos = filtrados
      .filter(o => o.tipo_ocorrencia === tipo)
      .map(o => ({
        x: o.precisao_gps || 0,
        y: tipoParaY[tipo]
      }));

    return {
      label: tipo,
      data: pontos,
      backgroundColor: '#5d759c',
      pointRadius: 5
    };
  });

  if (chartModelo) chartModelo.destroy();

  const ctx = document.getElementById('graficoModelo').getContext('2d');

  chartModelo = new Chart(ctx, {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Precisão do GPS (m)'
          },
          beginAtZero: true
        },
        y: {
          title: {
            display: true,
            text: 'Tipo de Ocorrência'
          },
          ticks: {
            stepSize: 1,
            callback: value => tipos[value - 1] || value
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx =>
              `Tipo: ${ctx.dataset.label}, GPS: ${ctx.parsed.x}m`
          }
        }
      }
    }
  });
}

// ============================
// ATUALIZA TODOS
// ============================
function atualizarGraficos() {
  const campoRosca = document.getElementById('variavelRosca').value;
  atualizarGraficoRosca(campoRosca);
  atualizarGraficoLinha();
  atualizarGraficoModelo();
}

// ============================
// EVENTOS
// ============================
document.getElementById('variavelRosca')
  .addEventListener('change', atualizarGraficos);

document.getElementById('dataInicio')
  .addEventListener('change', atualizarGraficos);

document.getElementById('dataFim')
  .addEventListener('change', atualizarGraficos);

// ============================
// CARREGAR DADOS
// ============================
async function carregarDados() {
  const res = await fetch('http://127.0.0.1:5000/api/ocorrencias');
  dadosOcorrencias = await res.json();
  atualizarGraficos();
}

window.onload = carregarDados;
