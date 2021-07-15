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

## Local (Guía de instalación)

Se debe clonar este repositorio al sistema de archivos local, usando

```bash
git clone git@github.com:IIC2513-2021-1/grupo-insertfunnyname-p2-backend.git
```

Además, se deben tener cargadas las variables de entorno listadas a continuación, lo cual puede hacerse a través de un archivo `.env` en la base del repositorio con el siguiente contenido:

```env
DB_DIALECT=postgres

DB_HOST=127.0.0.1
PORT=3000

DB_NAME=my_db_name
DB_USERNAME=my_db_username
DB_PASSWORD=my_db_password

NODE_ENV=development

# CLIENT
CLIENT_URL='localhost:3000'

# SENDGRID
SENDGRID_USER=apikey
SENDGRID_PASS=my_sendgrid_apikey
SENDGRID_EMAIL='template <example@example.com>'

# JSON WEB TOKEN
JWT_SECRET=my_jwt_secret

# GOOGLE
GOOGLE_PROJECT_ID=my_google_project_id
GOOGLE_STORAGE_CREDS_PATH=google-credentials.json
GOOGLE_CREDENTIALS={
  "type": "service_account",
  "project_id": "my_google_project_id",
  "private_key_id": "<my_private_key_id>",
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

Detalles sobre las variables de entorno:

Las variables de entorno requieren de los siguientes servicios:
- El servicio de PostgreSQL corriendo en DB_HOST, con una base de datos ya creada con nombre `DB_NAME`, y un usuario de PostgreSQL con credenciales `DB_USERNAME` y `DB_PASSWORD`
- Se debe tener una cuenta de SENDGRID para el mailer, y se deben colocar las credenciales (apikey) en `SENDGRID_PASS`.
- Para el almacenamiento de imágenes, se debe tener un bucket creado en GCS (Google Cloud Storage). Se debe incluir la id del proyecto del bucket (`GOOGLE_PROJECT_ID`), y se debe crear una cuenta de servicio que tenga acceso de administrador a este bucket. Se deben colocar las credenciales de esta cuenta de servicio en `GOOGLE_CREDENTIALS` (es un JSON). Finalmente, se debe especificar la ID del bucket creado para el almacenamiento en `GOOGLE_STORAGE_BUCKET_ID`
- Opcionalmente, se puede estar ejecutando el frontend, para dirigir las requests desde ahí. Para esto, se debe incluir la URL en la variable `CLIENT_URL`, en la cual se ejecuta el frontend (generalmente localhost:3000), para temas de CORS.

Para el siguiente paso, se debe tener instalado `node` y `yarn`.

Para probar la versión local, se deben instalar los _node modules_ usando `yarn install`. Además, se deben ejecutar las migraciones, y opcionalmente las seeds a la base de datos, usando los comandos `yarn sequelize db:migrate` y `yarn sequelize db:seed:all` respectivamente. Los comandos se resumen a continuación.

```bash
# Instalar dependencias
yarn install
# Migrar esquema a base de datos
# (servicio de base de datos debe estar corriendo con la address especificada en .env)
yarn sequelize db:migrate
# Ejecutar seeds (opcional, recomendado)
yarn sequelize db:seed:all
```

Para el servidor se puede usar `yarn dev` o `yarn start`. Por defecto, el programa quedará escuchando requests en http://localhost:3000

## Diagrama ER
<img src="ER Diagram.svg" />