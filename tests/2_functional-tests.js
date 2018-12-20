/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          const{
            issue_title,
            issue_text,
            created_by,
            assigned_to,
            status_text,
            open,
            created_on,
            updated,
            _id,
          } = res.body;
          assert.equal(res.status, 200);
          assert.equal(issue_title, 'Title');
          assert.equal(issue_text, 'text');
          assert.equal(created_by, 'Functional Test - Every field filled in');
          assert.equal(assigned_to, 'Chai and Mocha');
          assert.equal(status_text, 'In QA');
          assert.equal(open, true);
          assert.isNotNull(_id);
          assert.property(res.body,'created_on');
          assert.property(res.body,'updated_on');
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Required field filled in',
        })
        .end(function(err, res){
          const{
            issue_title,
            issue_text,
            created_by,
            assigned_to,
            status_text,
            open,
            created_on,
            updated,
            _id,
          } = res.body;
          //checking required fields
          assert.equal(res.status, 200);
          assert.equal(issue_title, 'Title');
          assert.equal(issue_text, 'text');
          assert.equal(created_by, 'Functional Test - Required field filled in');
          //checking optional fields
          assert.equal(assigned_to, '', 'assigned_to should be ""(blank string)');
          assert.equal(status_text, '', 'status_text should be ""(blank string)');
          //Fields created by server
          assert.equal(open, true);
          assert.isNotNull(_id);
          assert.property(res.body,'created_on');
          assert.property(res.body,'updated_on');
          done();
        });
      });
      
      test('Missing required fields', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          // issue_text: 'text',//Requred field, now missing for test
          created_by: 'Functional Test - Missing required fields',
        })
        .end(function(err, res){
          assert.equal(res.status,400, `res.status should be 400, actual value was ${res.status}`);
          assert.equal(res.text,'missing required fields',`response body should be 'missing required fields', actual value was ${res.body}`);
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
          .send({
          })
        .end(function(err, res){
          assert.equal(res.text,`no updated field sent`)
          done();
        });
      });

      test('One field to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
          .send({
            _id : '5c1be39c6daf6c4fc299eb08',
            issue_title: "update Title",
          })
        .end(function(err, res){
          assert.equal(res.text,`successfully updated 5c1be39c6daf6c4fc299eb08`)
          done();
        });
      });

      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
          .send({
            _id : '5c1be39c6daf6c4fc299eb08',
            issue_title: "update Title",
            issue_text: 'new, incredible, text',
          })
        .end(function(err, res){
          assert.equal(res.text,`successfully updated 5c1be39c6daf6c4fc299eb08`)
          done();
        });
      });
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');
            done();
          });
      });
      
      test('One filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .send({
            "issue_title" : 'Turtle',
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');
            res.body.forEach(function(issue){
              assert.equal(issue.issue_title, 'Turtle');
            });
          
            done();
          });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .send({
            issue_title : 'Turtle',
            open  :  true
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');
            
            res.body.forEach(function(issue){
              assert.equal(issue.issue_title, 'Turtle');
              assert.equal(issue.open, true);
            });
          
            done();
          });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      
      test('No _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({
          })
          .end(function(err, res){
            assert.equal(res.text,`_id error`)
          done();
          });
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Valid Delete Test',
            issue_text: 'This should be deleted',
            created_by: 'Functional Test - DELETE w/ valid _id',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA'
          })
          .end(function(err, res){
            var textExpect = `deleted ${res.body._id}`
            chai.request(server)
            .delete('/api/issues/test')
            .send({
              _id : res.body._id,
            })
            .end(function(err, res){
              assert.equal(res.text, textExpect)
              done();
            });
          });
      });
      
      test('InValid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({
            _id : 'hoodlyHammers',
          })
          .end(function(err, res){
            assert.equal(res.text,`could not delete hoodlyHammers`)
          done();
          });
      });
    });

});
