import nodemailer from "nodemailer";

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ],
  );
}
function money(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;
}
function orderDate(value) {
  return value
    ? new Date(value).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "To be confirmed";
}

function fixedOrderEmailHero(bakery = {}) {
  return String(
    process.env.ORDER_EMAIL_HERO_IMAGE ||
      bakery.emailHeroImage ||
      bakery.orderEmailHeroImage ||
      bakery.heroImage ||
      "",
  ).trim();
}
function fixedOrderEmailLogo(bakery = {}) {
  return String(process.env.ORDER_EMAIL_LOGO || bakery.logo || "").trim();
}

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendPasswordResetCode(to, code) {
  const { SMTP_FROM, SMTP_USER } = process.env;
  const transporter = createTransporter();
  if (!transporter) {
    const error = new Error(
      "Password reset email is not configured yet. Add SMTP settings to the server environment.",
    );
    error.statusCode = 503;
    throw error;
  }
  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject: "My New Bakery admin password reset code",
    text: `Your My New Bakery admin password reset code is ${code}. It expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;color:#2c0903"><h2>My New Bakery</h2><p>Your admin password reset code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>This code expires in 10 minutes. If you did not request it, ignore this email.</p></div>`,
  });
}

export async function sendOrderConfirmation({
  to,
  customerName,
  customerEmail,
  order,
  bakery = {},
}) {
  const transporter = createTransporter();
  if (!transporter || !to) return false;

  const bakeryName = escapeHtml(bakery.bakeryName || "My New Bakery");
  const name = escapeHtml(customerName || "there");
  const orderNumber = escapeHtml(order.orderNumber);

  const fulfillment =
    order.fulfillmentType === "pickup" ? "Bakery pickup" : "Delivery";

  const deliveryDetail =
    order.fulfillmentType === "pickup"
      ? "Your order will be ready for collection at the bakery."
      : `Delivery to ${escapeHtml(
          [
            order.address?.line1,
            order.address?.area,
            order.address?.city,
          ]
            .filter(Boolean)
            .join(", ") || "your selected address",
        )}.`;

  const deliveryTime = escapeHtml(
    bakery.estimatedDeliveryTime ||
      bakery.orderTimings ||
      "We will confirm the exact time with you shortly.",
  );

  const heroImage = fixedOrderEmailHero(bakery);
  const brandLogo = fixedOrderEmailLogo(bakery);

  /*
   * ---------------------------------------------------------
   * LOGO
   * ---------------------------------------------------------
   */
  const logo = brandLogo
    ? `
      <img
        src="${escapeHtml(brandLogo)}"
        alt="${bakeryName}"
        width="70"
        height="70"
        style="
          display:block;
          width:70px;
          height:70px;
          margin:0 auto;
          border:0;
          object-fit:contain;
        "
      >
    `
    : `
      <div
        style="
          width:70px;
          height:70px;
          margin:0 auto;
          border:2px solid #f4b52e;
          border-radius:50%;
          color:#f4b52e;
          font:700 17px Georgia,serif;
          line-height:70px;
          text-align:center;
          box-sizing:border-box;
        "
      >
        MNB
      </div>
    `;

  /*
   * ---------------------------------------------------------
   * HERO IMAGE
   * ---------------------------------------------------------
   */
  const hero = heroImage
    ? `
      <img
        src="${escapeHtml(heroImage)}"
        alt="Freshly baked order"
        width="420"
        height="390"
        style="
          display:block;
          width:100%;
          height:390px;
          min-height:390px;
          border:0;
          object-fit:cover;
        "
      >
    `
    : `
      <div
        style="
          width:100%;
          height:390px;
          min-height:390px;
          background:linear-gradient(
            145deg,
            #9b621a 0%,
            #f3d39a 100%
          );
        "
      ></div>
    `;

  /*
   * ---------------------------------------------------------
   * ITEMS
   * ---------------------------------------------------------
   */
  const items = (order.items || [])
    .map((item) => {
      const image = String(
        item.image || item.product?.images?.[0] || "",
      ).trim();

      const thumbnail = image
        ? `
          <img
            src="${escapeHtml(image)}"
            alt="${escapeHtml(item.name)}"
            width="145"
            height="112"
            style="
              display:block;
              width:145px;
              height:112px;
              border:0;
              border-radius:12px;
              object-fit:cover;
            "
          >
        `
        : `
          <div
            style="
              width:145px;
              height:112px;
              border-radius:12px;
              background:#f5e7c9;
              color:#926128;
              font:700 11px Arial,sans-serif;
              line-height:112px;
              text-align:center;
            "
          >
            ITEM
          </div>
        `;

      return `
        <tr>
          <td
            style="
              padding:13px 0 16px;
              border-bottom:1px solid #ead8b9;
            "
          >
            <table
              role="presentation"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="width:100%;"
            >
              <tr>

                <td
                  width="165"
                  valign="middle"
                  style="width:165px;"
                >
                  ${thumbnail}
                </td>

                <td
                  valign="middle"
                  style="padding-left:8px;"
                >
                  <strong
                    style="
                      display:block;
                      color:#24140f;
                      font:700 18px Arial,sans-serif;
                      line-height:1.35;
                    "
                  >
                    ${escapeHtml(item.name)}
                  </strong>

                  <span
                    style="
                      display:block;
                      margin-top:7px;
                      color:#806653;
                      font:15px Arial,sans-serif;
                    "
                  >
                    ${escapeHtml(item.size || "Standard size")}
                    ×
                    ${Number(item.quantity) || 1}
                  </span>
                </td>

                <td
                  width="115"
                  align="right"
                  valign="middle"
                  style="
                    width:115px;
                    color:#24140f;
                    font:700 17px Arial,sans-serif;
                    white-space:nowrap;
                  "
                >
                  ${money(
                    (Number(item.price) || 0) *
                      (Number(item.quantity) || 1),
                  )}
                </td>

              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");

  /*
   * ---------------------------------------------------------
   * URGENT DELIVERY
   * ---------------------------------------------------------
   */
  const urgent = Number(order.urgentFee)
    ? `
      <tr>
        <td
          style="
            padding:7px 0;
            color:#553321;
            font:16px Arial,sans-serif;
          "
        >
          Urgent delivery
        </td>

        <td
          align="right"
          style="
            padding:7px 0;
            color:#24140f;
            font:16px Arial,sans-serif;
          "
        >
          ${money(order.urgentFee)}
        </td>
      </tr>
    `
    : "";

  /*
   * ---------------------------------------------------------
   * CHARGES
   * ---------------------------------------------------------
   */
  const charges = `
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        width:100%;
        margin-top:27px;
        border:1px solid #e6ca98;
        border-radius:16px;
        background:#fffdf9;
      "
    >
      <tr>
        <td style="padding:20px 25px;">

          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="width:100%;"
          >

            <tr>
              <td
                style="
                  padding:7px 0;
                  color:#553321;
                  font:16px Arial,sans-serif;
                "
              >
                Items subtotal
              </td>

              <td
                align="right"
                style="
                  padding:7px 0;
                  color:#24140f;
                  font:16px Arial,sans-serif;
                "
              >
                ${money(order.subtotal)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:7px 0;
                  color:#553321;
                  font:16px Arial,sans-serif;
                "
              >
                Delivery charges
              </td>

              <td
                align="right"
                style="
                  padding:7px 0;
                  color:#24140f;
                  font:16px Arial,sans-serif;
                "
              >
                ${
                  Number(order.deliveryFee)
                    ? money(order.deliveryFee)
                    : "Free"
                }
              </td>
            </tr>

            ${urgent}

            <tr>
              <td
                colspan="2"
                style="
                  padding-top:15px;
                  border-bottom:1px dotted #ddc394;
                "
              >
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding-top:17px;
                  color:#24140f;
                  font:700 18px Arial,sans-serif;
                "
              >
                Grand total
              </td>

              <td
                align="right"
                style="
                  padding-top:10px;
                  color:#a25d18;
                  font:700 34px Georgia,serif;
                  white-space:nowrap;
                "
              >
                ${money(order.total)}
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  `;

  /*
   * ---------------------------------------------------------
   * CUSTOMER DETAILS
   * ---------------------------------------------------------
   */
  const customerDetails = `
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        width:100%;
        margin-top:25px;
      "
    >
      <tr>

        <td
          width="4"
          style="
            width:4px;
            background:#c8781b;
            font-size:0;
            line-height:0;
          "
        >
          &nbsp;
        </td>

        <td
          style="
            padding:7px 0 7px 21px;
          "
        >

          <strong
            style="
              display:block;
              margin-bottom:11px;
              color:#87460f;
              font:700 13px Arial,sans-serif;
              letter-spacing:1.5px;
            "
          >
            CUSTOMER DETAILS
          </strong>

          <span
            style="
              display:block;
              color:#24140f;
              font:16px/1.8 Arial,sans-serif;
            "
          >
            <b>Name:</b> ${name}
            <br>

            <b>Email:</b>
            <a
              href="mailto:${escapeHtml(customerEmail || to)}"
              style="color:#1b5e9e;"
            >
              ${escapeHtml(customerEmail || to)}
            </a>

            <br>

            <b>Phone:</b>
            ${escapeHtml(order.phone || "Not provided")}
          </span>

        </td>

      </tr>
    </table>
  `;

  /*
   * =========================================================
   * MAIN EMAIL HTML
   * =========================================================
   */
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>Order Confirmation</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#fff9ef;
  "
>

<table
  role="presentation"
  cellpadding="0"
  cellspacing="0"
  border="0"
  width="100%"
  style="
    width:100%;
    background:#fff9ef;
  "
>
<tr>
<td
  align="center"
  style="
    padding:18px 10px;
  "
>

<!-- ===================================================== -->
<!-- MAIN CONTAINER -->
<!-- ===================================================== -->

<table
  role="presentation"
  cellpadding="0"
  cellspacing="0"
  border="0"
  width="720"
  style="
    width:100%;
    max-width:720px;
    border:1px solid #e4c48b;
    border-radius:25px;
    background:#fffdfa;
    overflow:hidden;
  "
>

<!-- ===================================================== -->
<!-- HEADER -->
<!-- ===================================================== -->

<tr>
<td
  style="
    padding:0;
    background:#fffdfa;
  "
>

<table
  role="presentation"
  cellpadding="0"
  cellspacing="0"
  border="0"
  width="100%"
  style="
    width:100%;
    border-collapse:collapse;
  "
>

<tr>

<!-- LEFT HEADER -->
<td
  width="58%"
  valign="top"
  style="
    width:58%;
    height:390px;
    padding:32px 28px 24px;
    background:
      radial-gradient(
        circle at 20% 18%,
        #69250c 0%,
        #3a0e05 38%,
        #210701 73%,
        #160400 100%
      );
    color:#fff8e8;
    text-align:center;
    border-radius:24px 0 0 0;
  "
>

${logo}

<div
  style="
    margin-top:9px;
    color:#f4b52e;
    font:700 13px Arial,sans-serif;
    letter-spacing:1.5px;
  "
>
  ${bakeryName.toUpperCase()}
</div>

<h1
  style="
    margin:23px 0 0;
    color:#fffaf0;
    font:500 48px/1.03 Georgia,serif;
  "
>
  Your order is in<br>
  the oven!
</h1>

<p
  style="
    margin:21px 0 0;
    color:#f5dfbd;
    font:18px/1.5 Arial,sans-serif;
  "
>
  Thank you for choosing ${bakeryName},<br>
  ${name}.
</p>

<!-- decorative line -->
<table
  role="presentation"
  cellpadding="0"
  cellspacing="0"
  border="0"
  align="center"
  style="
    margin:22px auto 0;
  "
>
<tr>

<td
  width="90"
  style="
    width:90px;
    border-top:1px solid #a66c25;
    font-size:0;
  "
>
  &nbsp;
</td>

<td
  width="35"
  align="center"
  style="
    width:35px;
    color:#f4b52e;
    font:27px Georgia,serif;
  "
>
  ♡
</td>

<td
  width="90"
  style="
    width:90px;
    border-top:1px solid #a66c25;
    font-size:0;
  "
>
  &nbsp;
</td>

</tr>
</table>

</td>

<!-- RIGHT HEADER IMAGE -->
<td
  width="42%"
  valign="top"
  style="
    width:42%;
    padding:0;
    height:390px;
    overflow:hidden;
    border-radius:0 24px 0 0;
  "
>
  ${hero}
</td>

</tr>

<!-- CURVED / WAVY TRANSITION -->
<tr>

<td
  colspan="2"
  height="22"
  style="
    height:22px;
    padding:0;
    background:#fffdfa;
    font-size:0;
    line-height:0;
  "
>

  <div
    style="
      height:22px;
      margin-top:-1px;
      background:#fffdfa;
      border-radius:50% 50% 0 0 / 100% 100% 0 0;
      border-top:1px solid #d8a95d;
    "
  >
    &nbsp;
  </div>

</td>

</tr>

</table>

</td>
</tr>

<!-- ===================================================== -->
<!-- CONTENT -->
<!-- ===================================================== -->

<tr>
<td
  style="
    padding:25px 50px 0;
  "
>

<p
  style="
    margin:0;
    color:#2b1710;
    font:18px/1.6 Arial,sans-serif;
  "
>
  We have received your order and will prepare everything fresh
  with care.
</p>

<!-- ===================================================== -->
<!-- ORDER NUMBER -->
<!-- ===================================================== -->

<table
  role="presentation"
  cellpadding="0"
  cellspacing="0"
  border="0"
  width="100%"
  style="
    width:100%;
    margin-top:22px;
    border-radius:16px;
    background:linear-gradient(
      90deg,
      #fff0cf 0%,
      #fff8e8 100%
    );
  "
>

<tr>

<td
  width="82"
  align="center"
  style="
    width:82px;
    padding:17px 0 17px 17px;
  "
>
  <div
    style="
      width:64px;
      height:64px;
      border-radius:50%;
      background:#f9e8c5;
      color:#8f4a14;
      font:31px Georgia,serif;
      line-height:64px;
      text-align:center;
    "
  >
    ▣
  </div>
</td>

<td
  style="
    padding:17px 20px;
  "
>

<span
  style="
    display:block;
    color:#8f4a14;
    font:700 13px Arial,sans-serif;
    letter-spacing:1.4px;
  "
>
  ORDER NUMBER
</span>

<strong
  style="
    display:block;
    margin-top:7px;
    color:#2c0903;
    font:700 26px Georgia,serif;
  "
>
  ${orderNumber}
</strong>

</td>

</tr>
</table>

<!-- ===================================================== -->
<!-- ITEMS -->
<!-- ===================================================== -->

<table
  role="presentation"
  cellpadding="0"
  cellspacing="0"
  border="0"
  width="100%"
  style="
    width:100%;
    margin-top:28px;
  "
>

<tr>

<td
  style="
    padding-bottom:8px;
    color:#8f4a14;
    font:700 13px Arial,sans-serif;
    letter-spacing:1.3px;
  "
>
  YOUR ITEMS
</td>

<td
  align="right"
  style="
    padding-bottom:8px;
    color:#8f4a14;
    font:700 13px Arial,sans-serif;
    letter-spacing:1.3px;
  "
>
  AMOUNT
</td>

</tr>

${items}

</table>

${charges}

<!-- ===================================================== -->
<!-- DELIVERY -->
<!-- ===================================================== -->

<table
  role="presentation"
  cellpadding="0"
  cellspacing="0"
  border="0"
  width="100%"
  style="
    width:100%;
    margin-top:25px;
    border:1px solid #e3c58d;
    border-radius:16px;
    background:#fffaf0;
    overflow:hidden;
  "
>

<tr>

<td
  style="
    padding:12px 22px;
    background:#2c0903;
    color:#f5cc62;
    font:700 13px Arial,sans-serif;
    letter-spacing:1.3px;
  "
>
  ◷ &nbsp; DELIVERY SCHEDULE
</td>

</tr>

<tr>

<td
  style="
    padding:20px 22px;
  "
>

<strong
  style="
    display:block;
    color:#2c0903;
    font:700 19px Arial,sans-serif;
  "
>
  ${fulfillment} · ${orderDate(order.deliveryDate)}
</strong>

<span
  style="
    display:block;
    margin-top:10px;
    color:#8f4a14;
    font:16px/1.5 Arial,sans-serif;
  "
>
  <b>Estimated time:</b>
  ${deliveryTime}
</span>

<span
  style="
    display:block;
    margin-top:7px;
    color:#65422d;
    font:15px/1.55 Arial,sans-serif;
  "
>
  ${deliveryDetail}
</span>

</td>

</tr>

</table>

${customerDetails}

<!-- ===================================================== -->
<!-- UPDATE / CONTACT -->
<!-- ===================================================== -->

<table
  role="presentation"
  cellpadding="0"
  cellspacing="0"
  border="0"
  width="100%"
  style="
    width:100%;
    margin:25px 0 0;
    border-radius:17px;
    background:#fff1d5;
  "
>

<tr>

<td
  width="70"
  align="center"
  style="
    width:70px;
    padding:15px 0 15px 15px;
  "
>
  <div
    style="
      width:57px;
      height:57px;
      border-radius:50%;
      background:#f8e6c2;
      color:#8f4a14;
      font:24px Georgia,serif;
      line-height:57px;
      text-align:center;
    "
  >
    ▤
  </div>
</td>

<td
  style="
    padding:15px;
    color:#5e3d2d;
    font:15px/1.55 Arial,sans-serif;
  "
>
  We will keep you updated as your order moves forward.
  <br>
  For any question, please contact us at
  ${escapeHtml(
    bakery.phone || bakery.email || "the bakery",
  )}.
</td>

</tr>

</table>

</td>
</tr>

<!-- ===================================================== -->
<!-- FOOTER -->
<!-- ===================================================== -->

<tr>

<td
  style="
    padding:21px 25px;
    margin-top:28px;
    background:#f6e3b9;
    color:#79522e;
    text-align:center;
    font:14px Arial,sans-serif;
  "
>
  ♡ &nbsp; Freshly baked with love &nbsp;•&nbsp;
  ${bakeryName}
</td>

</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

  /*
   * ---------------------------------------------------------
   * SEND EMAIL
   * ---------------------------------------------------------
   */
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `${bakery.bakeryName || "My New Bakery"} | Order ${order.orderNumber} received`,
    text: `Hi ${customerName || "there"}, thank you for your order ${
      order.orderNumber
    }. Total: ${money(order.total)}. ${fulfillment} date: ${orderDate(
      order.deliveryDate,
    )}. Estimated time: ${
      bakery.estimatedDeliveryTime ||
      bakery.orderTimings ||
      "to be confirmed"
    }.`,
    html,
  });

  return true;
}
