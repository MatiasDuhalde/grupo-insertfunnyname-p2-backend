# FindHomy API

**Grupo InsertFunnyName**

## Docs

La documentación fue generada usando la herramienta de Postman, y se puede encontrar publicada en el siguiente link:

https://documenter.getpostman.com/view/15970655/TzeTKA1X

Se puede exportar una Collection a Postman para poder probar los endpoints directamente en la app usando el botón _Run in Postman_ que se encuentra arriba y a la derecha de la documentación.

Se incluye también la base para los endpoints secundarios, pero no están implementados. La lista de endpoints implementados se puede ver al comienzo de la documentación (están todos los principales)

Los endpoints que requieren un token se encuentran señalados en la documentación con un candado, y además, poseen un subtitulo que indica que requieren un bearer token. Este token se obtiene accediendo al endpoint `POST /auth`. Además, hay endpoints que requieren un token de administrador para utilizarlos. Estos

Aquellos endpoints que requieren un _body_, se muestra la estructura que este debe tener, indicando el tipo de cada entrada, y si son opcionales o no.

Algunos endpoints pueden opcionalmente recibir un archivo (generalmente una imagen). Los campos de estas requests deben enviarse como form-data (incluyendo la imagen), según se explica en la documentación.

En la columna de la derecha de la documentación (asumiendo que se usa el layout default para la interfaz _Double Column_), se pueden ver ejemplos de request con `cURL`, y el response correspondiente que retorna. Se incluye un ejemplo de Success, y varios ejemplos de errores que pueden ocurrir.

## Production deploy url

https://findhomy-api.herokuapp.com

Para probar los endpoints de la versión de producción de FindHomy, se debe anteponer esta url a todos los paths, como en el siguiente ejemplo:

**GET /properties**

```bash
https://findhomy-api.herokuapp.com/properties
```

## Local

http://localhost:3000

Para probar la versión local, se deben instalar los _node modules_ usando `yarn install`, y ejecutar el servidor usando `yarn dev` o `yarn start`. También, se deben entregarle al programa variables de entorno. Esto se puede hacer con un archivo `.env` colocado en la base de este repositorio, con la siguiente estructura:

```env
DB_DIALECT=postgres

DB_HOST=127.0.0.1
PORT=3000

DB_NAME=my_db_name
DB_USERNAME=my_db_username
DB_PASSWORD=my_db_password

NODE_ENV=development

# SENDGRID
SENDGRID_USER=apikey
SENDGRID_PASS=my_sendgrid_apikey
SENDGRID_EMAIL='template <example@example.com>'

# JSON WEB TOKEN
JWT_SECRET=my_jwt_secret

# GOOGLE
GOOGLE_PROJECT_ID=my_google_project_id
GOOGLE_STORAGE_CREDS_PATH=google-storage-creds.json
GOOGLE_STORAGE_CREDS={
  "type": "service_account",
  "project_id": "my_google_project_id",
  "private_key_id": "8148b0fb35e32319fddbc59da25d7e0f1f5be35e",
  "private_key": "-----BEGIN PRIVATE KEY-----\n <my_service_account_private_key> \n-----END PRIVATE KEY-----\n",
  "client_email": "my_client_email_user@my_google_project_id.iam.gserviceaccount.com",
  "client_id": "my_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/my_client_email"
}
GOOGLE_STORAGE_BUCKET_ID=my_storage_bucket_id
```
