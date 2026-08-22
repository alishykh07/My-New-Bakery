import nodemailer from 'nodemailer';

function escapeHtml(value='') { return String(value).replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[character]); }
function money(value) { return `Rs. ${Number(value || 0).toLocaleString('en-PK')}`; }
function orderDate(value) { return value ? new Date(value).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' }) : 'To be confirmed'; }

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT) || 587, secure: Number(SMTP_PORT) === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
}

export async function sendPasswordResetCode(to, code) {
  const { SMTP_FROM, SMTP_USER } = process.env;
  const transporter = createTransporter();
  if (!transporter) {
    const error = new Error('Password reset email is not configured yet. Add SMTP settings to the server environment.');
    error.statusCode = 503;
    throw error;
  }
  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject: 'My New Bakery admin password reset code',
    text: `Your My New Bakery admin password reset code is ${code}. It expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;color:#2c0903"><h2>My New Bakery</h2><p>Your admin password reset code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>This code expires in 10 minutes. If you did not request it, ignore this email.</p></div>`
  });
}

export async function sendOrderConfirmation({ to, customerName, customerEmail, order, bakery = {} }) {
  const transporter = createTransporter();
  if (!transporter || !to) return false;
  const bakeryName = escapeHtml(bakery.bakeryName || 'My New Bakery');
  const name = escapeHtml(customerName || 'there');
  const orderNumber = escapeHtml(order.orderNumber);
  const items = (order.items || []).map(item => `<tr><td style="padding:13px 0;border-bottom:1px solid #f0dfbd"><strong style="color:#3b0e06">${escapeHtml(item.name)}</strong><br><span style="font-size:12px;color:#876046">${escapeHtml(item.size || 'Standard size')} × ${Number(item.quantity) || 1}</span></td><td style="padding:13px 0;border-bottom:1px solid #f0dfbd;text-align:right;font-weight:700;color:#3b0e06">${money((Number(item.price) || 0) * (Number(item.quantity) || 1))}</td></tr>`).join('');
  const fulfillment = order.fulfillmentType === 'pickup' ? 'Bakery pickup' : 'Delivery';
  const deliveryDetail = order.fulfillmentType === 'pickup' ? 'Your order will be ready for collection.' : `Delivery to ${escapeHtml([order.address?.line1, order.address?.area, order.address?.city].filter(Boolean).join(', ') || 'your selected address')}.`;
  const deliveryTime = escapeHtml(bakery.estimatedDeliveryTime || bakery.orderTimings || 'We will confirm the exact time with you shortly.');
  const charges = `<div style="margin-top:22px;padding:17px 18px;border:1px solid #ead3a2;border-radius:10px;background:#fffaf0;font-size:13px;color:#65422d"><div style="display:flex;justify-content:space-between;gap:16px"><span>Items subtotal</span><strong>${money(order.subtotal)}</strong></div><div style="display:flex;justify-content:space-between;gap:16px;margin-top:10px"><span>Delivery charges</span><strong>${Number(order.deliveryFee) ? money(order.deliveryFee) : 'Free'}</strong></div>${Number(order.urgentFee) ? `<div style="display:flex;justify-content:space-between;gap:16px;margin-top:10px"><span>Urgent delivery</span><strong>${money(order.urgentFee)}</strong></div>` : ''}<div style="display:flex;justify-content:space-between;gap:16px;margin-top:15px;padding-top:15px;border-top:2px solid #e8ca8e;align-items:end"><span style="font-weight:700;color:#3b0e06">Grand total</span><strong style="font-family:Georgia,serif;font-size:25px;color:#8f4a14">${money(order.total)}</strong></div></div>`;
  const customerDetails = `<div style="margin-top:25px;padding:17px 18px;border-left:4px solid #d18a27;background:#fff8e9;font-size:13px;line-height:1.7"><strong style="display:block;margin-bottom:7px">Customer details</strong><span style="display:block"><b>Name:</b> ${name}</span><span style="display:block"><b>Email:</b> ${escapeHtml(customerEmail || to)}</span><span style="display:block"><b>Phone:</b> ${escapeHtml(order.phone || 'Not provided')}</span></div>`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `${bakery.bakeryName || 'My New Bakery'} | Order ${order.orderNumber} received`,
    text: `Hi ${customerName || 'there'}, thank you for your order ${order.orderNumber}. Total: ${money(order.total)}. ${fulfillment} date: ${orderDate(order.deliveryDate)}. Estimated time: ${bakery.estimatedDeliveryTime || bakery.orderTimings || 'to be confirmed'}.`,
    html: `<div style="margin:0;padding:32px 12px;background:#fff8e9;font-family:Arial,sans-serif;color:#3b0e06"><div style="max-width:620px;margin:auto;overflow:hidden;border:1px solid #ead3a2;border-radius:18px;background:#fffdf7;box-shadow:0 12px 35px rgba(68,22,3,.12)"><div style="padding:34px 38px;background:linear-gradient(135deg,#2c0903,#5c1a09);color:#fff4d5;text-align:center"><div style="margin-bottom:10px;color:#fece00;font-size:11px;font-weight:700;letter-spacing:2px">MY NEW BAKERY</div><h1 style="margin:0;font-family:Georgia,serif;font-size:30px;font-weight:500">Your order is in the oven!</h1><p style="margin:13px 0 0;color:#f3d99d;font-size:14px;line-height:1.6">Thank you for choosing ${bakeryName}, ${name}.</p></div><div style="padding:30px 38px"><p style="margin:0 0 20px;font-size:15px;line-height:1.65">We have received your order and will prepare everything fresh with care.</p><div style="margin-bottom:22px;padding:16px 18px;border-radius:10px;background:#fff0c4"><span style="display:block;margin-bottom:5px;color:#8f4a14;font-size:10px;font-weight:700;letter-spacing:1.4px">ORDER NUMBER</span><strong style="font-size:19px">${orderNumber}</strong></div><table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="padding-bottom:9px;text-align:left;color:#8f4a14;font-size:10px;letter-spacing:1px">YOUR ITEMS</th><th style="padding-bottom:9px;text-align:right;color:#8f4a14;font-size:10px;letter-spacing:1px">AMOUNT</th></tr></thead><tbody>${items}</tbody></table>${charges}<div style="margin-top:25px;overflow:hidden;border:1px solid #ead3a2;border-radius:10px;background:#fff8e9;font-size:13px;line-height:1.65"><div style="padding:10px 18px;background:#2c0903;color:#ffd974;font-size:10px;font-weight:700;letter-spacing:1.2px">DELIVERY SCHEDULE</div><div style="padding:17px 18px"><strong style="display:block;margin-bottom:8px;font-size:15px">${fulfillment} · ${orderDate(order.deliveryDate)}</strong><span style="display:block;margin-bottom:8px;color:#8f4a14"><b>Estimated time:</b> ${deliveryTime}</span><span style="display:block;color:#65422d">${deliveryDetail}</span></div></div>${customerDetails}<p style="margin:25px 0 0;color:#76543e;font-size:13px;line-height:1.65">We will keep you updated as your order moves forward. For any question, please contact us at ${escapeHtml(bakery.phone || bakery.email || 'the bakery')}.</p></div><div style="padding:18px 30px;background:#f5e4ba;color:#79522e;text-align:center;font-size:11px">Freshly baked with love · ${bakeryName}</div></div></div>`
  });
  return true;
}
