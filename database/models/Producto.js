module.exports = (sequelize, dataTypes) => {
    let alias = "Producto";
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            notNull: true,
            autoIncrement: true
        },
        id_categoria: {
            type: dataTypes.INTEGER,
            notNull: true
        },
        titulo: {
            type: dataTypes.STRING(100),
            notNull: true
        },
        precio: {
            type: dataTypes.INTEGER,
            notNull: true
        },
        descripcion: {
            type: dataTypes.TEXT,
            notNull: true
        },
        marca: {
            type: dataTypes.STRING(100),
            notNull: true
        },
        modelo: {
            type: dataTypes.STRING(100),
            notNull: true
        },
        cantidad_disponible: {
            type: dataTypes.INTEGER,
            notNull: true
        }
    }
    let config = {
        tableName: "producto",
        timestamps: false
    }

    const Producto = sequelize.define(alias, cols, config);

    Producto.associate = function(models){
        Producto.belongsToMany(models.Genero_Musical, {
            as: "generos",
            through: "producto_genero",
            foreignKey: "id_genero_musical",
            otherKey: "id_producto",
            timestamps: false
        })
        Producto.hasMany(models.Foto, {
            as: "fotos",
            foreignKey: "id_producto"
        })
        Producto.belongsTo(models.Categoria, {
            as: "categoria",
            foreignKey: "id_categoria"
        })
    }

    return Producto;
}