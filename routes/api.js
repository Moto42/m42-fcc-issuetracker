/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect       = require('chai').expect;
var MongoClient  = require('mongodb');
var ObjectId     = require('mongodb').ObjectID;
var mongoose     = require('mongoose');
var issueSchema  = require('../schema/issueSchema');
var Issue        = mongoose.model('Issue', issueSchema);

const CONNECTION_STRING = process.env.DB; 
//MongoClient.connect(CONNECTION_STRING, function(err, db) {});
mongoose.connect(CONNECTION_STRING);

module.exports = function (app) { 
  //M42 Middleware, move to own file later?
  
  function postNewIssue(req, res, next){
    const issue = new Issue({
      project     : req.params.project,
      issue_title : req.body.issue_title,
      issue_text  : req.body.issue_text,
      created_by  : req.body.created_by,
      assigned_to : req.body.assigned_to,
      status_text : req.body.status_text,
    });
    issue.save(function(err,issue){
      if(!err){
        req.body.issue = issue;
        next();
      } else {
        res.send('error saving issue to database')
      }
    })
  }
  
  function checkRequiredFields(req, res, next){
    const {
        issue_title,
        issue_text,
        created_by,
      } = req.body
    if(!issue_title || !issue_text || !created_by) {
      res.status(400).send('missing required fields')
    } else {
      next();
    }
  }
  
  function getIssuesByProject(req, res, next){
    var project = req.params.project;
    Issue.find({project: project},(err, issues)=>{
      if(!err){
        req.issues = issues;
        next();
      }else{
        res.send('error retrieving issues from database');
      }
    });
  }
    
  function filterIssues(req, res, next){
    var issues = req.issues;
    // console.log(req.body.issue_title)
    // console.log(req.issues)
    // console.log( issues.filter( (issue)=>issue.issue_title === req.body.issue_title ) )
    issues = req.body.assigned_to ? issues.filter( (issue)=>issue.assigned_to === req.body.assigned_to ) : issues;
    issues = req.body.status_text ? issues.filter( (issue)=>issue.status_text === req.body.status_text ) : issues;
    issues = req.body.open        ? issues.filter( (issue)=>issue.open        === req.body.open )        : issues;
    issues = req.body.project     ? issues.filter( (issue)=>issue.project     === req.body.project )     : issues;
    issues = req.body.issue_title ? issues.filter( (issue)=>issue.issue_title === req.body.issue_title ) : issues;
    issues = req.body.issue_text  ? issues.filter( (issue)=>issue.issue_text  === req.body.issue_text )  : issues;
    issues = req.body.created_by  ? issues.filter( (issue)=>issue.created_by  === req.body.created_by )  : issues;
    issues = req.body.created_on  ? issues.filter( (issue)=>issue.created_on  === req.body.created_on )  : issues;
    issues = req.body.updated_on  ? issues.filter( (issue)=>issue.updated_on  === req.body.updated_on )  : issues;
    // created_before, created_after, updated_before, updated_after : Out of primary scope, add feature later maybe
    req.issues = issues;
    next();
  }
  
    
  app.route('/api/issues/:project')
  
    .get(getIssuesByProject, filterIssues, function (req, res){
      res.json(req.issues);
    })
    
    .post(checkRequiredFields, postNewIssue, function (req, res){
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body
      res.json(req.body.issue)
    })
    
    .put(function (req, res){
      var project = req.params.project;
      //check to ensure updated fields were sent
      if(!(           
          req.body.issue_title ||
          req.body.issue_text  ||
          req.body.created_by  ||
          req.body.assigned_to ||
          req.body.issue_title ||
          req.body.satus_text  ||
          req.body.open
        )){res.send('no updated field sent');}
        
    
      var updated = {};
      updated._id = req.body._id;
      if( req.body.issue_title) updated.issue_title = req.body.issue_title;
      if( req.body.issue_text ) updated.issue_text  = req.body.issue_text;
      if( req.body.created_by ) updated.created_by  = req.body.created_by;
      if( req.body.assigned_to) updated.assigned_to = req.body.assigned_to;
      if( req.body.status_text) updated.status_text = req.body.status_text;
      if( req.body.open === 'false' ) updated.open  = false;
      
      Issue.update({_id:req.body._id},updated,function(err,response){
        if(err) res.send(`could not update ${req.body._id}`);
        else    res.send(`successfully updated ${req.body._id}`);
      })
    
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      if(!req.body._id){
        res.send('_id error')
        return;
      } else {
       Issue.deleteOne({_id:req.body._id},function(err){
         if(!err){
           res.send(`deleted ${req.body._id}`);
         }else{
           res.send(`could not delete ${req.body._id}`);
         }
       }); 
      }
    });
    
};
