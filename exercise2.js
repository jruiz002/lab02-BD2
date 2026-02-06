
db.vehiculos.aggregate([
  {
    $addFields: {
      price_num: {
        $toDouble: {
          $replaceOne: {
            input: "$price",
            find: { $literal: "$" },
            replacement: ""
          }
        }
      }
    }
  },
  {
    $group: {
      _id: {
        brand: "$brand",
        year: "$year"
      },
      total_models: { $sum: 1 },
      avg_price: { $avg: "$price_num" }
    }
  },
  {
    $sort: {
      "_id.brand": 1,
      "_id.year": 1
    }
  },
  {
    $out: "vehiculos_brand_stats"
  }
])


mongoexport \
  --uri "mongodb+srv://jruiz002:password@cluster-db2.relkult.mongodb.net/laboratorio2" \
  --collection vehiculos_brand_stats \
  --type=json \
  --out vehiculos_brand_stats.json \
  --jsonArray
db.vehiculos.aggregate([
  {
    $addFields: {
      price_num: {
        $toDouble: {
          $replaceOne: {
            input: "$price",
            find: { $literal: "$" },
            replacement: ""
          }
        }
      }
    }
  },
  {
    $match: {
      year: { $gte: 1990, $lte: 1999 }
    }
  },
  {
    $sort: { price_num: -1 }
  },
  {
    $limit: 20
  },
  {
    $project: {
      _id: 0,
      brand: 1,
      model: 1,
      year: 1,
      price: "$price_num"
    }
  },
  {
    $out: "vehiculos_top_models"
  }
])

mongoexport \
  --uri "mongodb+srv://jruiz002:password@cluster-db2.relkult.mongodb.net/laboratorio2" \
  --collection vehiculos_top_models \
  --type=csv \
  --fields brand,model,year,price \
  --out vehiculos_top_models.csv
