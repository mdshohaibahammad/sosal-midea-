const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Video extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Video.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    aspectRatio: {
      type: DataTypes.STRING,
      defaultValue: '9:16',
    },
    platforms: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'posting', 'posted', 'failed'),
      defaultValue: 'pending',
    },
    platformResults: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    postedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    viewsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sharesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Video',
    tableName: 'videos',
    timestamps: true,
  }
);

module.exports = Video;