export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.N8N_DISCOVERY_WEBHOOK_URL) {
    return new Response(JSON.stringify({ error: "Webhook not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const required = ["first_name", "email", "country_timezone", "level", "goal"];
  for (const field of required) {
    if (!payload[field] || String(payload[field]).trim() === "") {
      return new Response(JSON.stringify({ error: `Missing field: ${field}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  const email = String(payload.email).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const cleanPayload = {
    first_name: String(payload.first_name).trim().slice(0, 100),
    email: email.slice(0, 254),
    country_timezone: String(payload.country_timezone).trim().slice(0, 120),
    level: String(payload.level).trim().slice(0, 50),
    goal: String(payload.goal).trim().slice(0, 700),
    source: String(payload.source || "landing_page").trim().slice(0, 80),
    submitted_at: String(payload.submitted_at || new Date().toISOString()),
    status: String(payload.status || "New").trim().slice(0, 30)
  };

  try {
    const upstream = await fetch(env.N8N_DISCOVERY_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanPayload)
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: "Lead service unavailable" }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return new Response(JSON.stringify({ error: "Lead service unavailable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
