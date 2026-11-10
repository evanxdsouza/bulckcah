# bulckcah

Mirrors `hackclub.com` and all its subdomains on `bulckcah.com`. A request to `toolbox.bulckcah.com/x` is fetched from `toolbox.hackclub.com/x`, and `hackclub.com` links, redirects and cookies in the response are rewritten to `bulckcah.com`.

## Deploy on Coolify

### 1. DNS

Point both records at the Coolify server:

```
bulckcah.com    A  <server-ip>
*.bulckcah.com  A  <server-ip>
```

### 2. Wildcard certificate resolver

Let's Encrypt only issues wildcards over DNS-01. In **Servers → your server → Proxy**, add to the Traefik command (example for Cloudflare DNS):

```
- '--certificatesresolvers.dns.acme.dnschallenge=true'
- '--certificatesresolvers.dns.acme.dnschallenge.provider=cloudflare'
- '--certificatesresolvers.dns.acme.email=you@example.com'
- '--certificatesresolvers.dns.acme.storage=/traefik/acme-dns.json'
```

Add `CF_DNS_API_TOKEN` (a token with Zone → DNS → Edit) to the proxy's environment and restart the proxy. Other DNS providers work with a different `provider` and their own variables, see the [Traefik docs](https://doc.traefik.io/traefik/https/acme/#providers).

### 3. App

Create an application from this repo with the **Dockerfile** build pack. Leave **Domains** empty and replace the container labels with:

```
traefik.enable=true
traefik.http.routers.bulckcah-http.rule=Host(`bulckcah.com`) || HostRegexp(`^.+\.bulckcah\.com$`)
traefik.http.routers.bulckcah-http.entrypoints=http
traefik.http.routers.bulckcah-http.middlewares=redirect-to-https
traefik.http.routers.bulckcah.rule=Host(`bulckcah.com`) || HostRegexp(`^.+\.bulckcah\.com$`)
traefik.http.routers.bulckcah.entrypoints=https
traefik.http.routers.bulckcah.tls=true
traefik.http.routers.bulckcah.tls.certresolver=dns
traefik.http.routers.bulckcah.tls.domains[0].main=bulckcah.com
traefik.http.routers.bulckcah.tls.domains[0].sans=*.bulckcah.com
traefik.http.services.bulckcah.loadbalancer.server.port=3000
traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
```

These use Traefik v3 syntax. On Traefik v2, use ``HostRegexp(`{sub:.+}.bulckcah.com`)``.

Deploy, then check with `curl -I https://www.bulckcah.com`.

## Run locally

```
bun server.js
curl -H 'Host: bulckcah.com' localhost:3000
```
