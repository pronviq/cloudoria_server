module.exports = class FileDto {
  // id; AUTO
  name;
  // is_favorite; CHANGEABLE
  path;
  size;
  user_id;
  type;
  parent_file; // number (parent id)
  // timestamp; AUTO

  constructor(model) {
    // this.id = model.id; AUTO
    this.name = model.name;
    // this.is_favorite = model.is_favorite;
    this.path = model.path;
    this.size = model.size;
    this.user_id = model.user_id;
    this.type = model.type;
    this.parent_file = model.parent_file;
    // this.timestamp = model.timestamp;
  }
};
