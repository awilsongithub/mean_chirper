// angular module construction named app, specifically chirpApp
// [ ] holds dependencies for the app ngRoute, ngResource
// these are script linked in index.html to cdn
var app = angular.module('chirpApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http){
   // DECLARE $ROOTSCOPE VARIABLES.
   // ANGUULAR USES $ TO DENOTE PUBLIC/GLOBAL? OBJECTS USABLE ANYWHERE
   // used here to carry auth status & current_user ...
   // ... since app will behave differently based on these conditions
   $rootScope.authenticated = false; // by default
   $rootScope.current_user = '';

   $rootScope.logout= function(){
      // auth/signout calls logout() = mongoose method? that clears credentials?
      $http.get('auth/signout');
      $rootScope.authenticated = false;
      $rootScope.current_user = '';
   };
});

// ANGULAR ROUTEPROVIDER W/ NGROUTE
// WHEN HIT URL X, USE TEMPLATE Y AND CTRLR Z
// so we don't need call controllers frorm the view file
app.config(function($routeProvider){
   $routeProvider
   // post timeline
   .when('/', {
      templateUrl: 'main.html',
      controller: 'mainController'
   })
   // login
   .when('/login', {
      templateUrl: 'login.html',
      controller: 'authController'
   })
   // signup
   .when('/register', {
      templateUrl: 'register.html',
      controller: 'authController'
   });
});

// RANDOM REMINDER: WHEN A PARAM PASSED > FUNCTION, IT'S PASSED TO
// THE CODE BLOCK SCOPE OF THE FUNCTION. EX: doubleIt(x){ return x*2; }
// http.get all posts from api, put in factory object
// CALL IT POSTSERVICE, PAS IT HTTP AS IT WILL NEED IT.
// WE'LL PASS THIS TO MAINCONTROLLER BY INJECTING IT IN PARAMS OF CTRLR
// THIS FACTORY ABSTRACTS ALL THIS LOGIC AWAY SO WE DO IT ONCE AND CREATION
// CALL IT IN DIF. PLACES IN APP. it's NAME IS POSTSERVICE

// why commented out????
// app.factory('postService', function($http){
//    var baseUrl = 'api/posts'; // api
//    var factory = {};  // object
//    factory.getAll = function(){ // make http calls
//       return $http.get(baseUrl); // use api defined
//    };
//    return factory; // has all posts data
// });

app.factory('postService', function($resource){
   // using ngResource module takes endpoint api and creates many helper functions
   // if included in a controller.
   return $resource('/api/posts/:id');
});

// MAINCONTROLLER
// is a function attaching a model onto $scope
// items passed with $scope are in the scope of the view templates
app.controller('mainController', function($scope, $rootScope, postService){
   // attach variables onto our $scope (post objects, posts array)
   $scope.posts = postService.query(); // query is get req
   $scope.newPost = {created_by: '', text: '', created_at: ''};

   // CALL POSTSERVICE (commented out since not in video at 3:48...)
   // postService.getAll().success(function(data){
   //    $scope.posts = data;
   // });

   // POST CREATION FORM CALLS THIS FUNCTION
   // THIS NEW VERSION USES CURRENT_USER FROM THE LOGIN FUNCTION
   // INSTEAD OF USERNAME VALUE FROM FORM PARAMETERS
   // COMMENTED OUT OLD $SCOPE.POST FUNCTION PER MOD 5 NEW ONE (BELOW)
   $scope.post = function() {
      $scope.newPost.created_by = $rootScope.current_user;
      $scope.newPost.created_at = Date.now();

      postService.save($scope.newPost, function(){
         $scope.posts = postService.query(); // refresh post stream
         $scope.newPost = {created_by: '', text: '', created_at: ''}; // clear new post
      });
   }; // end post

}); // end maincontroller

// create post and push onto posts array
// called on form submit, adds timestamp, pushes onto post array
//    $scope.post = function(){
//       $scope.newPost.created_at = Date.now();
//       $scope.posts.push($scope.newPost);
//       // resest newPost
//       $scope.newPost = {created_by: '', text: '', created_at: ''};
//   };


// AUTHENTICATION CONTROLLER
// $location is used for redirects
app.controller('authController', function($scope, $http, $rootScope, $location){
   // create or identify user with key values from form
   $scope.user = {username: '', password: ''};
   $scope.error_message = '';

   $scope.login = function(){
      // pass user to auth/login
      // post to this api, get user object for current user = data
      // ajax call syntax: $http.httpmethod('/url').success(successCallback)
      $http.post('/auth/login', $scope.user).success(function(data){
         if(data.state == 'success'){
            $rootScope.authenticated = true;
            $rootScope.current_user = data.user.username;
            $location.path('/'); // redirect
         }
         else{
            $scope.error_message = data.message;
         }
      }); // end success
   }; // end login

   // almost same as login function
   $scope.register = function(){
      $http.post('/auth/signup', $scope.user).success(function(data){
         if(data.state == 'success'){
            $rootScope.authenticated = 'true';
            $rootScope.current_user = data.user.username;
            $location.path('/');
         }
         else{
            $scope.error_message = data.message;
         }
      }); // end success
   }; // end register
}); // end authcontroller
