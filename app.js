//. app.js
var express = require( 'express' ),
    session = require( 'express-session' ),
    ejs = require( 'ejs' ),
    request = require( 'request' ),
    app = express();

require( 'dotenv' ).config();

app.use( session({
  secret: 'github-issues-api',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxage: 1000 * 60 * 10   //. 10min
  }
}));

//. env values
var API_SERVER = 'API_SERVER' in process.env ? process.env.API_SERVER : '' 

var github = require( './api/github' );
app.use( '/api/github', github );

app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );

//. GitHub API
app.getMe = async function( token ){
  return new Promise( async function( resolve, reject ){
    if( token ){
      var option = {
        url: 'https://api.github.com/user',
        headers: { Authorization: 'token ' + token, 'User-Agent': 'github-issues-api' },
        method: 'GET'
      };
      request( option, function( err, res0, body ){
        if( err ){
          console.log( {err} );
          resolve( { status: false, error: err } );
        }else{
          if( typeof body == 'string' ){
            body = JSON.parse( body );
          }
          //. { login: 'dotnsf', id: XXXX, avatar_url: 'https://xxx', name: 'きむらけい', email: 'dotnsf@gmail.com', .. }
          resolve( { status: true, user: body } );
        }

      });
    }else{
      resolve( { status: false, error: 'token needed.' } );
    }
  });
};

var client_id = 'CLIENT_ID' in process.env ? process.env.CLIENT_ID : '';
var client_secret = 'CLIENT_SECRET' in process.env ? process.env.CLIENT_SECRET : '';
var callback_url = 'CALLBACK_URL' in process.env ? process.env.CALLBACK_URL : '';

app.get( '/login', function( req, res ){
  res.redirect( 'https://github.com/login/oauth/authorize?client_id=' + client_id + '&redirect_uri=' + callback_url + '&scope=repo' );
});

app.get( '/logout', function( req, res ){
  if( req.session.oauth ){
    req.session.oauth = {};
  }
  //res.contentType( 'application/json; charset=utf-8' );
  //res.write( JSON.stringify( { status: true }, null, 2 ) );
  //res.end();
  res.redirect( '/' );
});

app.get( '/callback', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var code = req.query.code;
  var option = {
    url: 'https://github.com/login/oauth/access_token',
    form: { client_id: client_id, client_secret: client_secret, code: code, redirect_uri: callback_url },
    method: 'POST'
  };
  request( option, async function( err, res0, body ){
    if( err ){
      console.log( { err } );
    }else{
      var tmp1 = body.split( '&' );
      for( var i = 0; i < tmp1.length; i ++ ){
        var tmp2 = tmp1[i].split( '=' );
        if( tmp2.length == 2 && tmp2[0] == 'access_token' ){
          var access_token = tmp2[1];

          req.session.oauth = {};
          req.session.oauth.token = access_token;

          var r = await app.getMe( access_token );
          if( r && r.status && r.user ){
            req.session.oauth.id = r.user.id;
            req.session.oauth.avatar_url = r.user.avatar_url;
            req.session.oauth.name = r.user.name;
            req.session.oauth.email = r.user.email;
          }
        }
      }
    }
    res.redirect( '/' );
  });
});


//. index page
app.get( '/', function( req, res ){
  var user = null;
  if( req.session.oauth && req.session.oauth.id ){
    user = {
      token: req.session.oauth.token,
      id: req.session.oauth.id,
      name: req.session.oauth.name,
      email: req.session.oauth.email,
      avatar_url: req.session.oauth.avatar_url
    };
  }
  res.render( 'index', { API_SERVER: API_SERVER, user: user } );
});

//. CMS page
app.get( '/cms', function( req, res ){
  var GITHUB_REPO = 'GITHUB_REPO' in process.env ? process.env.GITHUB_REPO : '' 
  var user = null;
  if( req.session.oauth && req.session.oauth.id ){
    user = {
      token: req.session.oauth.token,
      id: req.session.oauth.id,
      name: req.session.oauth.name,
      email: req.session.oauth.email,
      avatar_url: req.session.oauth.avatar_url
    };
  }

  var params = [];
  Object.keys( req.query ).forEach( function( key ){
    params.push( key + '=' + req.query[key] );
  });
  res.render( 'cms', { API_SERVER: API_SERVER, GITHUB_REPO: GITHUB_REPO, user: user, params: params.join( '&' ) } );
});

//. listening port
var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server starting on " + port + " ..." );

module.exports = app;
