module.exports = class UserDto {
  id;
  username;
  email;
  disk_space;
  used_space;
  avatar;
  gender;
  theme;
  root_directory;
  ip;

  constructor(model) {
    this.id = model.id;
    this.username = model.username;
    this.email = model.email;
    this.disk_space = model.disk_space;
    this.used_space = model.used_space;
    this.avatar = model.avatar;
    this.gender = model.gender;
    this.theme = model.theme;
    this.root_directory = model.root_directory;
    this.ip = model.ip;
  }
};
