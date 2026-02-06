use lab02_index

// Ejercicio 1.1 para generar data de prueba
db.usuarios.drop()
db.createCollection("usuarios")

// ---------- Configuración ----------
var TOTAL = 100000
var bulk = db.usuarios.initializeUnorderedBulkOp()

var nombres = ["Juan", "Ana", "Luis", "María", "Carlos", "Laura", "Pedro", "Sofía"]
var ciudades = ["CDMX", "Guadalajara", "Monterrey", "Puebla"]
var colores = ["azul", "rojo", "verde", "negro"]
var idiomas = ["es", "en"]
var temas = ["claro", "oscuro"]
var productos = ["Producto 1", "Producto 2", "Producto 3"]
var tagsBase = ["tag1", "tag2", "tag3", "tag4"]

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysBack) {
  var now = new Date()
  return new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000)
}

function generarHistorialCompras() {
  var compras = []
  var total = Math.floor(Math.random() * 6) + 1

  for (var i = 0; i < total; i++) {
    compras.push({
      producto: Math.random() < 0.7 ? "Producto 1" : randomItem(productos),
      fecha: randomDate(30) // Últimos 30 días
    })
  }
  return compras
}

function generarTags() {
  var tags = []

  // Forzamos presencia frecuente de tag2
  tags.push("tag2")

  var totalExtras = Math.floor(Math.random() * 3)
  for (var i = 0; i < totalExtras; i++) {
    var tag = randomItem(tagsBase)
    if (tags.indexOf(tag) === -1) {
      tags.push(tag)
    }
  }

  return tags
}

// ---------- Inserción ----------
for (var i = 1; i <= TOTAL; i++) {

  var amigos = Math.random() < 0.15
    ? Math.floor(Math.random() * 2000) + 1000 // >1000 amigos
    : Math.floor(Math.random() * 500)

  bulk.insert({
    nombre: randomItem(nombres),
    email: "usuario" + i + "@correo.com",
    fecha_registro: randomDate(730),
    puntos: Math.floor(Math.random() * 1000),
    historial_compras: generarHistorialCompras(),
    direccion: {
      calle: "Calle " + Math.floor(Math.random() * 1000),
      ciudad: randomItem(ciudades),
      codigo_postal: Math.floor(Math.random() * 90000) + 10000
    },
    tags: generarTags(),
    activo: Math.random() < 0.7,
    notas: "Usuario generado para pruebas de índices",
    visitas: Math.floor(Math.random() * 500),
    cantidad_amigos: amigos,
    preferencias: {
      color: randomItem(colores),
      idioma: randomItem(idiomas),
      tema: randomItem(temas)
    }
  })

  if (i % 1000 === 0) {
    print("Insertados: " + i)
  }
}

bulk.execute()
print("Carga completa de 100,000 documentos")

// 1.2 Realizar la siguientes consultas
//Usuarios activos con más de 500 puntos
db.usuarios.find({activo: true, puntos: { $gt:500 }});

//Usuarios que han comprado el producto "Producto 1" en la última semana.
var hace7Dias = new Date()
hace7Dias.setDate(hace7Dias.getDate() - 7)

db.usuarios.find({
  historial_compras: {
    $elemMatch: {
      producto: "Producto 1",
      fecha: { $gte: hace7Dias }
    }
  }
})

//Usuarios con la etiqueta "tag2" y que tienen más de 100 visitas.
db.usuarios.find({
  tags: "tag2",
  visitas: { $gt: 100 }
})

//Usuarios con preferencias de color "azul" y que tienen entre 1000 y 2000 amigos.
db.usuarios.find({
  "preferencias.color": "azul",
  cantidad_amigos: { $gte: 1000, $lte: 2000 }
})

// 1.3 Realice una evaluación del rendimiento de cada consulta.
//Usuarios activos con más de 500 puntos
db.usuarios.find({activo: true, puntos: { $gt:500 }}).explain("executionStats");

//Usuarios que han comprado el producto "Producto 1" en la última semana.
var hace7Dias = new Date()
hace7Dias.setDate(hace7Dias.getDate() - 7)

db.usuarios
  .find({
    historial_compras: {
      $elemMatch: {
        producto: "Producto 1",
        fecha: { $gte: hace7Dias }
      }
    }
  })
  .explain("executionStats");

//Usuarios con la etiqueta "tag2" y que tienen más de 100 visitas.
db.usuarios.find({
  tags: "tag2",
  visitas: { $gt: 100 }
}).explain("executionStats");

//Usuarios con preferencias de color "azul" y que tienen entre 1000 y 2000 amigos.
db.usuarios.find({
  "preferencias.color": "azul",
  cantidad_amigos: { $gte: 1000, $lte: 2000 }
}).explain("executionStats");

// 1.4. Diseño de Índices
db.usuarios.createIndex({ activo: 1, puntos: 1 })

db.usuarios.createIndex({
  "historial_compras.producto": 1,
  "historial_compras.fecha": 1
})

db.usuarios.createIndex({ tags: 1, visitas: 1 })

db.usuarios.createIndex({
  "preferencias.color": 1,
  cantidad_amigos: 1
})

db.usuarios.getIndexes()

// 1.7. Resuelva y comente
db.usuarios.find({
  activo: true,
  puntos: { $gt: 500 },
  visitas: { $gte: 100 },
  tags: { $size: 3 }
}).explain("executionStats")


