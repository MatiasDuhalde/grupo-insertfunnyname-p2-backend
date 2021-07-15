# Manual de Usuario: FindHomy API

**Grupo InsertFunnyName**


## ¿Casos de uso?
FindHomy es una API diseñada para la venta y compra de propiedades, que permite interacciones entre usuarios. Cuando ingresa un usuario nuevo, este tiene la posibilidad de cambiar su foto de perfil, tener reuniones con otros usuarios y poner a la venta su propiedad. Además, tales pueden comentar sobre propiedades y reportar tanto al usuario como el comentario que creó otro. 


### Footer
El footer contiene “About”, “Contact” y “Terms of Service” que van a redirigir al usuario a distintas páginas externas con videos. Mientras que, “Docs” va a mostrar la documentación de esta API y “TrippyBook” va a mostrar la entrega pasada. 


### Properties

Este botón, "Brower our Properties", se encuentra en la página de inicio, y dirige al usuario a ver todas las propiedades que han sido creadas. Las funcionalidades que tenga el usuario va a depender de su estado, si está registrado o no. Si el usuario no está registrado, entonces va a poder filtrar propiedades por “keywords” o el tipo de propiedad y si se arrienda o se vende. En el caso que el usuario haya ingresado a la propiedad, se va a ver el botón de “Create Property” donde se va a ver un formulario donde el usuario puede registrar su propiedad. 

Si el usuario le hace click a la propiedad, se va a ver la propiedad con más detalles. Si el usuario no está registrado, no va a poder hacer nada más. 

En cambio el usuario registrado va a poder ver dos botones debajo de la propiedad llamados “Book Meeting” y “Report Poster User”. Además, se va a poder ver la sección llamada “Comments” donde el usuario puede comentar sobre una propiedad. El usuario que creó el comentario va a poder editar o borrar su comentario; mientras que otro usuario registrado va a poder reportar el comentario. 
En caso de seleccionar “Book Meeting” se debe llenar un formulario y el usuario que creó esta propiedad va a poder ver, al estar viendo su propiedad, la cantidad de “meetings” solicitados. 
Nuevamente, sólo los usuarios registrados van a poder reportar dentro de FindHomy, se pueden reportar usuarios o reportar el comentario esto puede ser visto dentro de la misma propiedad  en los comentarios aparece la opción en el formato de un botón. Al reportar, sólo se espera saber la razón y la solicitud es enviada al administrador para que determine que se va a hacer. 

### Admin

Existen cuatro usuarios que son administradores. A diferencia de usuarios normales, cuando un administrador ingresa la página la navbar cambia, y se muestra un botón que lleva al panel de control, es acá donde se van a ver dos tablas “User reports” y “Comment reports”, al lado de cada usuario o comentario reportado hay un botón que permite borrar al usuario y/o comentario. También, el administrador no tiene un perfil como los usuarios registrados. 

### Sign Up

En la página de home, en la navbar hay un botón llamado “Sign up” en el extremo derecho. Es acá donde hay un formulario para que el usuario que no tiene una cuenta en FindHomy pueda acceder a las funcionalidades adicionales que tienen los usuarios registrados. Notar, que si se crea un nuevo usuario se debe hacer login. 

### Login 

Para hacer login, en la navbar hay un botón llamado “Login”; se le pide al usuario que ingrese el correo electrónico y clave correspondiente en un formulario; después esté usuario va a ver que su navbar cambia, ahora no está “Login” o “Sign up” sino aparece “My Profile” y “Logout”. 



### Profile

Dentro de “Mi Profile”, que puede ser visto en él navegar para los usuarios registrados. Se tiene la opción de editar el perfil,hay un botón llamado “Edit” donde se debe rellenar el formulario con los cambios que se quieren realizar; ver los meetings que han sido planificados, hay un botón para ver más detalles;, y las reuniones para la venta de la propiedad. 

