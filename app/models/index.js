const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
// const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  timezone: dbConfig.timezone, // Set the timezone here
  define: {
    timestamps: false, //true: createdAt & updatedAt
    freezeTableName: true, //To avoid plurals while creating table name
  },
  operatorsAliases: 0,
  logging: false,
  // logging: process.env.NODE_ENV === 'development' ? console.log : false, // Enable logging in development
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
// db.tutorials = require("./tutorial.model.js")(sequelize, DataTypes);

db.admins = require("./admin_models/admin.model.js")(sequelize, Sequelize);
db.customers = require("./customer_models/customer.model.js")(
  sequelize,
  Sequelize
);
db.otp = require("./other_models/otp.model.js")(sequelize, Sequelize);
db.countries = require("./admin_models/country.model.js")(sequelize, Sequelize);
db.kycs = require("./admin_models/kyc.model.js")(sequelize, Sequelize);
db.plans = require("./admin_models/plans.model.js")(sequelize, Sequelize);
db.purchases = require("./admin_models/purchase.model.js")(sequelize, Sequelize);
db.benefit_schedules = require("./admin_models/BenefitSchedule.model.js")(sequelize, Sequelize);
// Establish relationships (associations)
db.countries.hasMany(db.kycs, {
  foreignKey: "country_id",
  as: "kycs",
  onDelete: "CASCADE",
});
db.kycs.belongsTo(db.countries, {
  foreignKey: "country_id",
  as: "country",
});

db.plans.belongsTo(db.benefit_schedules, {
  foreignKey: "benefit_schedule_id",
  as: "benefitSchedule",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

db.benefit_schedules.hasMany(db.plans, {
  foreignKey: "benefit_schedule_id",
  as: "plans",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});


db.customers.hasMany(db.purchases, { foreignKey: "customer_id" });
db.purchases.belongsTo(db.customers, { foreignKey: "customer_id" });

db.plans.hasMany(db.purchases, { foreignKey: "plan_id" });
db.purchases.belongsTo(db.plans, { foreignKey: "plan_id" });

module.exports = db;
