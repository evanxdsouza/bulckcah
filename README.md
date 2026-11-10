# bulckcah

Mirrors `hackclub.com` and all its subdomains on `bulckcah.com`. A request to `toolbox.bulckcah.com/x` is fetched from `toolbox.hackclub.com/x`, and `hackclub.com` links, redirects and cookies in the response are rewritten to `bulckcah.com`.

Cloudflare sits in front and serves the public certificate for `bulckcah.com` and `*.bulckcah.com`. Coolify runs the proxy behind it.

## Deploy on Coolify

### 1. DNS

DNS for `bulckcah.com` is managed with octoDNS in [hackclub/dns](https://github.com/hackclub/dns). In `bulckcah.com.yaml`, point the apex and a wildcard at the Coolify server with Cloudflare's proxy on:

```yaml
"": # <contact>
- type: A
  value: <server-ip>
  octodns:
    cloudflare:
      proxied: true
"*": # <contact>
  type: A
  value: <server-ip>
  octodns:
    cloudflare:
      proxied: true
```

Keep the existing `TXT`, `MX`, `_dmarc` and `*._domainkey` records. The wildcard covers `www`.

### 2. Cloudflare

In the Cloudflare dashboard for `bulckcah.com`:

1. In **SSL/TLS → Overview**, set the mode to **Full (strict)**.
2. In **SSL/TLS → Edge Certificates**, turn on **Always Use HTTPS**.
3. In **SSL/TLS → Origin Server**, create an origin certificate for `bulckcah.com` and `*.bulckcah.com`, and save the certificate and private key.

The free Universal SSL certificate covers only one level of subdomain, so `a.b.bulckcah.com` does not work.

### 3. Origin certificate in Traefik

On the Coolify server, save the files from step 2:

```
/data/coolify/proxy/certs/bulckcah.com.pem
/data/coolify/proxy/certs/bulckcah.com.key
```

In **Servers → your server → Proxy → Dynamic Configurations**, add a file named `bulckcah.yaml`:

```yaml
tls:
  certificates:
    - certFile: /traefik/certs/bulckcah.com.pem
      keyFile: /traefik/certs/bulckcah.com.key
```

### 4. App

Create an application from this repo with the **Dockerfile** build pack. Leave **Domains** empty and replace the container labels with:

```
traefik.enable=true
traefik.http.routers.bulckcah.rule=Host(`bulckcah.com`) || HostRegexp(`^.+\.bulckcah\.com$`)
traefik.http.routers.bulckcah.entrypoints=https
traefik.http.routers.bulckcah.tls=true
traefik.http.services.bulckcah.loadbalancer.server.port=3000
```

These use Traefik v3 syntax. On Traefik v2, use ``HostRegexp(`{sub:.+}.bulckcah.com`)``.

Deploy, then check with `curl -I https://www.bulckcah.com`.

## Run locally

```
bun server.js
curl -H 'Host: bulckcah.com' localhost:3000
```
