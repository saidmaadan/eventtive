'use strict';

exports = module.exports = function(app, mongoose) {
  var eventSchema = new mongoose.Schema({
    title: { type: String, required:true},
    description: { type: String, },
    date: { type: Date, },
    author: { type: String, },
    username: { type: String, required:true },
    search: [String]
  });
  blogSchema.plugin(require('./plugins/pagedFind'));
  blogSchema.index({ title: 1 });
  blogSchema.index({ author: 1 });
  blogSchema.index({ date: 1 });
  blogSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Blog', blogSchema);
};
