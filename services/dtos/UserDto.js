module.exports = class UserDto {
  id;
  username;
  email;
  disk_space;
  used_space;
  avatar_path;
  gender;
  theme;
  root_directory;

  constructor(model) {
    this.id = model.id;
    this.username = model.username;
    this.email = model.email;
    this.disk_space = model.disk_space;
    this.used_space = model.used_space;
    this.avatar_path = model.avatar_path;
    this.gender = model.gender;
    this.theme = model.theme;
    this.root_directory = model.root_directory;
  }
};
