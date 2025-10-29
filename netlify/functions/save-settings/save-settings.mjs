const fetch = globalThis.fetch;

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST")
      return { statusCode: 405, body: "Method Not Allowed" };

    const json = JSON.parse(event.body || "{}");
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.REPO_FULL;
    const branch = process.env.BRANCH || "main";

    if (!token || !repo) return { statusCode: 500, body: "Missing env vars" };

    const url = `https://api.github.com/repos/${repo}/contents/data/settings.json?ref=${branch}`;

    const getRes = await fetch(url, {
      headers: { Authorization: `token ${token}` },
    });

    const sha = (await getRes.json()).sha;

    const putRes = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update settings.json via Netlify",
        content: Buffer.from(JSON.stringify(json), null, 2).toString("base64"),
        sha,
        branch,
      }),
    });

    return { statusCode: putRes.status, body: await putRes.text() };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
};
