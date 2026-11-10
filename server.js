const toUpstream = (s) => s.replaceAll("bulckcah.com", "hackclub.com");
const toMirror = (s) => s.replace(/(?<![@\w-])hackclub\.com/g, "bulckcah.com");
const TEXT = /html|css|javascript|json|xml|svg/;

Bun.serve({
  port: 3000,
  async fetch(req) {
    const host = req.headers.get("host")?.split(":")[0] ?? "";
    if (host !== "bulckcah.com" && !host.endsWith(".bulckcah.com")) {
      return new Response("Not found", { status: 404 });
    }

    const url = new URL(req.url);
    url.protocol = "https:";
    url.host = toUpstream(host);

    const headers = new Headers();
    for (const [k, v] of req.headers) if (k !== "host") headers.append(k, toUpstream(v));

    let res;
    try {
      res = await fetch(url, { method: req.method, headers, body: req.body, redirect: "manual" });
    } catch {
      return new Response("Bad gateway", { status: 502 });
    }

    const out = new Headers();
    for (const [k, v] of res.headers) {
      if (k !== "content-encoding" && k !== "content-length") out.append(k, toMirror(v));
    }

    const body = res.body && TEXT.test(res.headers.get("content-type") ?? "")
      ? toMirror(await res.text())
      : res.body;

    return new Response(body, { status: res.status, headers: out });
  },
});
