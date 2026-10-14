const ofertas = [];
const form = document.getElementById('form-oferta');
const lista = document.getElementById('lista-ofertas');

function renderizar() {
  lista.innerHTML = '';

  if (ofertas.length === 0) {
    const vazio = document.createElement('li');
    vazio.textContent = 'Nenhuma oferta cadastrada.';
    lista.appendChild(vazio);
    return;
  }

  ofertas.forEach((o) => {
    const li = document.createElement('li');
    li.textContent = `${o.alimento} (${o.quantidade}), validade ${o.validade}, doador: ${o.doador}`;
    lista.appendChild(li);
  });
}

form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  ofertas.push(Object.fromEntries(new FormData(form)));
  form.reset();
  renderizar();
});

renderizar();