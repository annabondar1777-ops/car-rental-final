const { store } = require("./_helpers");

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body || "{}");
    const id = data.id;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing ID" })
      };
    }

    const db = await store.get("clients", { type: "json" });
    const clients = db?.clients || [];

    const index = clients.findIndex(c => c.id === id);
    if (index === -1) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Not found" })
      };
    }

    clients[index] = { ...clients[index], ...data };

    await store.set("clients", { clients }, { type: "json" });

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: true, updated: clients[index] })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message })
    };
  }
};
