'use strict';

exports.find = function(req, res, next){
  req.query.title = req.query.title ? req.query.title : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {};
  if (req.query.username) {
    filters.username = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
  }

  req.app.db.models.Blog.pagedFind({
    filters: filters,
    keys: 'title description username',
    limit: req.query.limit,
    page: req.query.page,
    sort: req.query.sort
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      results.filters = req.query;
      res.send(results);
    }
    else {
      results.filters = req.query;
      res.render('blogs/index', { data: results.data });
    }
  });
};

exports.read = function(req, res, next){
  req.app.db.models.Blog.findById(req.params.id).exec(function(err, blog) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.send(blog);
    }
    else {
      res.render('blogs/details', { blog: blog });
    }
  });
};

exports.add = function(req, res){
  if(!req.isAuthenticated()){
    req.flash('error', 'You are not logged in');
      res.location('/blogs');
      res.redirect('/blogs');
  }
  res.render('blogs/add');

};

exports.create = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.title) {
      workflow.outcome.errors.push('Please enter a title.');
      return workflow.emit('response');
    }
    workflow.emit('createBlog');
  });

  workflow.on('createBlog', function() {
    var fieldsToSet = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      username: req.user.username,
      search: [
        req.body.title
      ]
    };
    req.app.db.models.Blog.create(fieldsToSet, function(err, blog) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = blog;
      req.flash('success', 'Blog Added');
      res.location('/blogs');
      res.redirect('/blogs');
    });
  });

  workflow.emit('validate');
};

exports.edit = function(req, res, next){
  req.app.db.models.Blog.findById(req.params.id).exec(function(err, blog) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.send(blog);
    }
    else {
      res.render('blogs/edit', { blog: blog });
    }
  });
};

exports.update = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.title) {
      workflow.outcome.errors.push('Please enter a title.');
      return workflow.emit('response');
    }
    workflow.emit('updateBlog');
  });

  workflow.on('updateBlog', function() {
    var fieldsToSet = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      username: req.user.username,
      search: [
        req.body.title
      ]
    };
    req.app.db.models.Blog.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, blog) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = blog;
      req.flash('success', 'Blog Updated');
      res.location('/blogs/blog/'+req.params.id);
      res.redirect('/blogs/blog/'+req.params.id);
    });
  });

  workflow.emit('validate');
};

exports.delete = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    workflow.emit('deleteBlog');
  });

  workflow.on('deleteBlog', function(err) {
    req.app.db.models.Blog.findByIdAndRemove(req.params.id, function(err, blog) {
      if (err) {
        return workflow.emit('exception', err);
      }
      req.flash('success', "Blog Deleted");
      res.location('/blogs');
      res.redirect('/blogs');
    });
  });

  workflow.emit('validate');
};

