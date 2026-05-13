**THIS FOLDER IS OVERWRITTEN WHEN THE IMAGE IS DEPLOYED.**

If you change something here you also need to change the configurations in ris-cm-infra

For authenticating with a locally running keycloak (like the one defined in the `docker-compose.yml`) please add these config options:

```json
"auth": {
  "url": "http://localhost:8443",
  "clientId": "ris-cm-local",
  "realm": "ris"
},
```
