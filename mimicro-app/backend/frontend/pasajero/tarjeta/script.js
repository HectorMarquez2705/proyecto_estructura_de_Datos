Auth.initPage('pasajero');

let tarjetaId = null;
let userId    = null;
let qrCode    = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = Auth.getUser();
  userId = user.sub;

  try {
    const data = await Api.get(`/tarjeta/${userId}`);
    tarjetaId = data.id;

    document.getElementById('tarjeta-numero').textContent = data.numero_tarjeta || '—';
    document.getElementById('tarjeta-saldo').textContent  = parseFloat(data.saldo).toFixed(2);
    document.getElementById('tarjeta-nombre').textContent = (user.nombre || 'Usuario').toUpperCase();

    // QR
    const qrEl = document.getElementById('qr-container');
    qrCode = new QRCode(qrEl, {
      text: data.numero_tarjeta || 'mimicro',
      width: 160, height: 160,
      colorDark: '#1e293b', colorLight: '#ffffff',
    });

    cargarHistorial();
  } catch { Toast.error('No se pudo cargar la tarjeta. Intentá de nuevo.'); }
});

async function cargarHistorial() {
  const body = document.getElementById('historial-body');
  try {
    const res  = await Api.get(`/tarjeta/${userId}/historial`);
    const txns = res.transacciones || res || [];
    const top10 = txns.slice(0, 10);

    if (top10.length === 0) {
      body.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">Sin transacciones</div></div>';
      return;
    }
    body.innerHTML = top10.map((t, i) => {
      const esRecarga = t.tipo === 'recarga';
      const fecha     = new Date(t.created_at).toLocaleString('es-BO', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
      return `<div class="txn-item" style="animation-delay:${i*0.05}s">
        <div class="txn-icon">${esRecarga ? '⬆️' : '⬇️'}</div>
        <div class="txn-info">
          <div class="txn-desc">${t.descripcion || (esRecarga ? 'Recarga' : 'Cobro de pasaje')}</div>
          <div class="txn-fecha">${fecha}</div>
        </div>
        <div class="txn-monto ${esRecarga ? 'recarga' : 'cobro'}">
          ${esRecarga ? '+' : '-'} Bs ${parseFloat(t.monto).toFixed(2)}
        </div>
      </div>`;
    }).join('');
  } catch { body.innerHTML = '<div class="empty-state"><div class="empty-title">Error al cargar el historial</div></div>'; }
}

function setSugerencia(monto) {
  document.getElementById('monto-recarga').value = monto;
}

async function confirmarRecarga() {
  const monto = parseFloat(document.getElementById('monto-recarga').value);
  if (!monto || monto < 5 || monto > 500) { Toast.warning('Ingresá un monto entre Bs 5 y Bs 500.'); return; }

  const btn = document.getElementById('btn-confirm-recarga');
  btn.disabled = true; btn.textContent = 'Procesando…';

  try {
    const res = await Api.post('/tarjeta/recargar', { usuario_id: userId, monto });
    const nuevoSaldo = res.saldo_nuevo ?? res.saldo ?? '—';
    document.getElementById('tarjeta-saldo').textContent = parseFloat(nuevoSaldo).toFixed(2);
    Modal.close('modal-recarga');
    Toast.success(`✅ Recarga de Bs ${monto.toFixed(2)} realizada con éxito`);
    document.getElementById('monto-recarga').value = '';
    cargarHistorial();
  } catch (err) {
    Toast.error(err.detail || 'Error al procesar la recarga.');
  } finally {
    btn.disabled = false; btn.textContent = '💰 Confirmar recarga';
  }
}
