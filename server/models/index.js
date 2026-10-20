const User = require('./User');
const Video = require('./Video');

User.hasMany(Video, { foreignKey: 'userId', as: 'videos', onDelete: 'CASCADE' });
Video.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Video,
};
