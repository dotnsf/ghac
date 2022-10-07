//. app.js
var express = require( 'express' ),
    cookieParser = require( 'cookie-parser' ),
    session = require( 'express-session' ),
    ejs = require( 'ejs' ),
    request = require( 'request' ),
    app = express();

require( 'dotenv' ).config();

app.use( session({
  secret: 'ghac',
  resave: false,
  saveUninitialized: false,
  cookie: {
    //domain: "ghac.me",
    httpOnly: true,
    secure: false,
    maxage: 1000 * 60 * 10   //. 10min
  }
}));

//. env values
var API_SERVER = 'API_SERVER' in process.env ? process.env.API_SERVER : '' 

var github = require( './api/github' );
app.use( '/api/github', github );

app.use( cookieParser() );
app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.use( function( req, res, next ){
  res.header( 'Access-Control-Allow-Credentials', true );
  res.header( 'Access-Control-Allow-Origin', '*' );
  res.header( 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE' );
  res.header( 'Access-Control-Allow-Headers', 'X-Requested-with, X-HTTP-Method-Override, Content-Type, Accept' );
  next();
});

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

  //res.redirect( '/' );
  //. #1  http://ghac.me/callback
  var redirect_path = '/';
  console.log( 3, req.session.ghac );
  if( req.session.ghac && req.session.ghac.user && req.session.ghac.repo ){
    redirect_path = '//' + req.session.ghac.user + '.' + req.get( 'host' ) + '/' + req.session.ghac.repo;
  }

  res.redirect( redirect_path );
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

    //. #1  http://ghac.me/callback
    var redirect_path = '/';
    console.log( 2, JSON.stringify( req.cookies ) );  //. {}

    res.redirect( redirect_path );
  });
});


//. CMS page
app.get( '/*', function( req, res, next ){
  //. #1
  var host = req.get( 'host' );
  var path = req.path;

  var tmp = path.split( '.' );
  if( tmp.length > 1 ){
  //. #1
    next();
  }else{
    var github_user = '';
    tmp = host.split( '.' );
    if( tmp.length > 1 ){
      github_user = tmp[0];
      tmp.shift();
      host = tmp.join( '.' );
    }

    var repo = '';
    tmp = path.split( '/' );
    if( tmp.length > 1 ){
      repo = tmp[1];
    }

    var github_repo = '';
    if( github_user && repo ){
      //. この時の github_user と repo は（後でリダイレクトできるように）記録しておきたい
      res.cookie( 'github_user', github_user, { domain: '.' + host, path: '/' } );
      res.cookie( 'repo', repo, { domain: '.' + host, path: '/' } );

      github_repo = github_user + '/' + repo;
    }

    var GITHUB_REPO = 'GITHUB_REPO' in process.env && process.env.GITHUB_REPO ? process.env.GITHUB_REPO : github_repo;
    console.log( 'GITHUB_REPO = ' + GITHUB_REPO );
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
  }
});

//. listening port
var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server starting on " + port + " ..." );

module.exports = app;
