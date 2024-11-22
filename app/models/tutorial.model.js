module.exports = (sequelize, Sequelize) => {
  const Tutorial = sequelize.define("tutorials", {
    id:{
      allowNull:false,
      autoIncrement:true,
      primaryKey:true,
      type:Sequelize.INTEGER
    },
    firstName:{
      type:Sequelize.STRING,
      allowNull:false,
    },
    lastName:{
      type:Sequelize.STRING,
      allowNull:false,
    },
    phoneNumber:{
      type:Sequelize.INTEGER,
      allowNull:false,
    },
    emailAddress:{
      type:Sequelize.STRING,
      allowNull:false,
    },
    gender:{
      type:Sequelize.STRING,
      allowNull:false,
    },
    delete_status: {
      // Soft delete field (0 = active, 1 = deleted)
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      get() {
        return format(this.getDataValue("createdAt"), "dd-MM-yyyy HH:mm:ss");
      },
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      get() {
        return format(this.getDataValue("createdAt"), "dd-MM-yyyy HH:mm:ss");
      },
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true, // Optional field, initially null
      defaultValue: null,
      get() {
        return format(this.getDataValue("deletedAt"), "dd-MM-yyyy HH:mm:ss");
      },
    },
  });

  return Tutorial;
};
