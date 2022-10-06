//. github.js
const PER_PAGE = 100;
const { Router } = require('express');

var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    request = require( 'request' ),
    api = express();

require( 'dotenv' ).config();

var settings_cors = 'CORS' in process.env ? process.env.CORS : '';
api.all( '/*', function( req, res, next ){
  if( settings_cors ){
    res.setHeader( 'Access-Control-Allow-Origin', settings_cors );
    res.setHeader( 'Vary', 'Origin' );
  }
  next();
});

api.use( bodyParser.urlencoded( { extended: true } ) );
api.use( bodyParser.json() );
api.use( express.Router() );

//. Issues
api.getIssues = async function( user, repo, params_obj, token ){
  return new Promise( async function( resolve, reject ){
    var url = 'https://api.github.com/repos/' + user + '/' + repo + '/issues';
    if( params_obj && typeof params_obj == 'object' ){
      var params = [];
      Object.keys( params_obj ).forEach( function( key ){
        var value = params_obj[key];
        params.push( key + '=' + value );
      });
      if( params.length > 0 ){
        url += ( '?' + params.join( '&' ) );
      }
    }

    var options = {
      url: url,
      method: 'GET',
      headers: { Accept: 'application/json', 'User-Agent': 'github-issues-api' }
    };
    if( token ){
      options.headers.Authorization = 'token ' + token;
    }
    request( options, ( err, res, body ) => {
      if( err ){
        console.log( { err } );
        resolve( { status: false, error: err } );
      }else{
        if( typeof body == 'string' ){
          body = JSON.parse( body );
        }
        //console.log( { body } );  //. レートリミットに達していると { "message": "API rate limit  exceeded for xx.xx.xx.xx. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)","documentation_url":"https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting" }
        if( body.message ){
          resolve( { status: false, params: params_obj, error: body } );
        }else{
          resolve( { status: true, params: params_obj, res_headers: res.headers, issues: body } );
        }
      }
    });
  });
};

//. Comments
api.getComments = async function( user, repo, issue_num, params_obj, token ){
  return new Promise( async function( resolve, reject ){
    var url = issue_num ? 
      'https://api.github.com/repos/' + user + '/' + repo + '/issues/' + issue_num + '/comments' :
      'https://api.github.com/repos/' + user + '/' + repo + '/issues/comments';

    if( params_obj && typeof params_obj == 'object' ){
      var params = [];
      Object.keys( params_obj ).forEach( function( key ){
        var value = params_obj[key];
        params.push( key + '=' + value );
      });
      if( params.length > 0 ){
        url += ( '?' + params.join( '&' ) );
      }
    }

    var options = {
      url: url,
      method: 'GET',
      headers: { Accept: 'application/json', 'User-Agent': 'github-issues-api' }
    };
    if( token ){
      options.headers.Authorization = 'token ' + token;
    }
    request( options, ( err, res, body ) => {
      if( err ){
        console.log( { err } );
        resolve( { status: false, error: err } );
      }else{
        if( typeof body == 'string' ){
          body = JSON.parse( body );
        }
        //console.log( { body } );
        resolve( { status: true, params: params_obj, res_headers: res.headers, comments: body } );
      }
    });
  });
};

//. Assignees
api.getAssignees = async function( user, repo, params_obj, token ){
  return new Promise( async function( resolve, reject ){
    var url = 'https://api.github.com/repos/' + user + '/' + repo + '/assignees';
    if( params_obj && typeof params_obj == 'object' ){
      var params = [];
      Object.keys( params_obj ).forEach( function( key ){
        var value = params_obj[key];
        params.push( key + '=' + value );
      });
      if( params.length > 0 ){
        url += ( '?' + params.join( '&' ) );
      }
    }

    var options = {
      url: url,
      method: 'GET',
      headers: { Accept: 'application/json', 'User-Agent': 'github-issues-api' }
    };
    if( token ){
      options.headers.Authorization = 'token ' + token;
    }
    request( options, ( err, res, body ) => {
      if( err ){
        console.log( { err } );
        resolve( { status: false, error: err } );
      }else{
        if( typeof body == 'string' ){
          body = JSON.parse( body );
        }
        //console.log( { body } );
        resolve( { status: true, params: params_obj, res_headers: res.headers, assignees: body } );
      }
    });
  });
};

//. Labels
api.getLabels = async function( user, repo, params_obj, token ){
  return new Promise( async function( resolve, reject ){
    var url = 'https://api.github.com/repos/' + user + '/' + repo + '/labels';
    if( params_obj && typeof params_obj == 'object' ){
      var params = [];
      Object.keys( params_obj ).forEach( function( key ){
        var value = params_obj[key];
        params.push( key + '=' + value );
      });
      if( params.length > 0 ){
        url += ( '?' + params.join( '&' ) );
      }
    }

    var options = {
      url: url,
      method: 'GET',
      headers: { Accept: 'application/json', 'User-Agent': 'github-issues-api' }
    };
    if( token ){
      options.headers.Authorization = 'token ' + token;
    }
    request( options, ( err, res, body ) => {
      if( err ){
        console.log( { err } );
        resolve( { status: false, error: err } );
      }else{
        if( typeof body == 'string' ){
          body = JSON.parse( body );
        }
        //console.log( { body } );
        resolve( { status: true, params: params_obj, res_headers: res.headers, labels: body } );
      }
    });
  });
};

//. Milestones
api.getMilestones = async function( user, repo, params_obj, token ){
  return new Promise( async function( resolve, reject ){
    var url = 'https://api.github.com/repos/' + user + '/' + repo + '/milestones';
    if( params_obj && typeof params_obj == 'object' ){
      var params = [];
      Object.keys( params_obj ).forEach( function( key ){
        var value = params_obj[key];
        params.push( key + '=' + value );
      });
      if( params.length > 0 ){
        url += ( '?' + params.join( '&' ) );
      }
    }

    var options = {
      url: url,
      method: 'GET',
      headers: { Accept: 'application/json', 'User-Agent': 'github-issues-api' }
    };
    if( token ){
      options.headers.Authorization = 'token ' + token;
    }
    request( options, ( err, res, body ) => {
      if( err ){
        console.log( { err } );
        resolve( { status: false, error: err } );
      }else{
        if( typeof body == 'string' ){
          body = JSON.parse( body );
        }
        //console.log( { body } );
        resolve( { status: true, params: params_obj, res_headers: res.headers, milestones: body } );
      }
    });
  });
};


api.get( '/issues/:user/:repo', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var user = req.params.user;
  var repo = req.params.repo;
  if( user && repo ){
    var token = req.query.token;

    //. #2
    var params_obj = { state: 'all', per_page: PER_PAGE };
    Object.keys( req.query ).forEach( function( key ){
      if( [ 'filter', 'state', 'labels' ].indexOf( key ) > -1 ){
        //. labels=AAA,BBB は AAA && BBB
        params_obj[key] = encodeURI( req.query[key] );
      }
    });

    var issues = [];
    var page = 1;
    var b = true;
    var result = null;

    while( b ){
      params_obj['page'] = page;
      result = await api.getIssues( user, repo, params_obj, token );
      if( result.status && result.issues && result.issues.length > 0 ){
        issues = issues.concat( result.issues );
      }

      if( !result.status || !result.issues || result.issues.length < PER_PAGE ){
        b = false;
      }else{
        page ++;
      }
    }
    //console.log( result );

    if( result.status ){
      res.write( JSON.stringify( { status: true, headers: result.res_headers, issues: issues, api_call: page }, null, 2 ) );
      res.end();
    }else if( result.error ){
      res.write( JSON.stringify( { status: false, error: result.error }, null, 2 ) );
      res.end();
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: result }, null, 2 ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'parameter user & repo are mandatory.' }, null, 2 ) );
    res.end();
  }
});

api.get( '/comments/:user/:repo', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var user = req.params.user;
  var repo = req.params.repo;
  if( user && repo ){
    var issue_num = req.query.issue_num;
    var token = req.query.token;

    var params_obj = { per_page: PER_PAGE };
    Object.keys( req.query ).forEach( function( key ){
      /*
      if( [ 'filter', 'state', 'labels' ].indexOf( key ) > -1 ){
        params_obj[key] = req.query[key];
      }
      */
    });

    var comments = [];
    var page = 1;
    var b = true;
    var result = null;
    while( b ){
      params_obj['page'] = page;
      result = await api.getComments( user, repo, issue_num, params_obj, token );
      if( result.status && result.comments && result.comments.length > 0 ){
        comments = comments.concat( result.comments );
      }

      if( !result.comments || result.comments.length < PER_PAGE ){
        b = false;
      }else{
        page ++;
      }
    }

    res.write( JSON.stringify( { status: true, headers: result.res_headers, comments: comments, api_call: page }, null, 2 ) );
    res.end();
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'parameter user & repo are mandatory.' }, null, 2 ) );
    res.end();
  }
});

api.get( '/assignees/:user/:repo', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var user = req.params.user;
  var repo = req.params.repo;
  if( user && repo ){
    var token = req.query.token;

    var params_obj = { per_page: PER_PAGE };
    Object.keys( req.query ).forEach( function( key ){
      /*
      if( [ 'filter', 'state', 'labels' ].indexOf( key ) > -1 ){
        params_obj[key] = req.query[key];
      }
      */
    });

    var assignees = [];
    var page = 1;
    var b = true;
    var result = null;
    while( b ){
      params_obj['page'] = page;
      result = await api.getAssignees( user, repo, params_obj, token );
      if( result.status && result.assignees && result.assignees.length > 0 ){
        assignees = assignees.concat( result.assignees );
      }

      if( !result.assignees || result.assignees.length < PER_PAGE ){
        b = false;
      }else{
        page ++;
      }
    }

    res.write( JSON.stringify( { status: true, headers: result.res_headers, assignees: assignees, api_call: page }, null, 2 ) );
    res.end();
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'parameter user & repo are mandatory.' }, null, 2 ) );
    res.end();
  }
});

api.get( '/labels/:user/:repo', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var user = req.params.user;
  var repo = req.params.repo;
  if( user && repo ){
    var token = req.query.token;

    var params_obj = { per_page: PER_PAGE };
    Object.keys( req.query ).forEach( function( key ){
      /*
      if( [ 'filter', 'state', 'labels' ].indexOf( key ) > -1 ){
        params_obj[key] = req.query[key];
      }
      */
    });

    var labels = [];
    var page = 1;
    var b = true;
    var result = null;
    while( b ){
      params_obj['page'] = page;
      result = await api.getLabels( user, repo, params_obj, token );
      if( result.status && result.labels && result.labels.length > 0 ){
        labels = labels.concat( result.labels );
      }

      if( !result.labels || result.labels.length < PER_PAGE ){
        b = false;
      }else{
        page ++;
      }
    }

    res.write( JSON.stringify( { status: true, headers: result.res_headers, labels: labels, api_call: page }, null, 2 ) );
    res.end();
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'parameter user & repo are mandatory.' }, null, 2 ) );
    res.end();
  }
});

api.get( '/milestones/:user/:repo', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var user = req.params.user;
  var repo = req.params.repo;
  if( user && repo ){
    var token = req.query.token;

    var params_obj = { per_page: PER_PAGE };
    Object.keys( req.query ).forEach( function( key ){
      /*
      if( [ 'filter', 'state', 'labels' ].indexOf( key ) > -1 ){
        params_obj[key] = req.query[key];
      }
      */
    });

    var milestones = [];
    var page = 1;
    var b = true;
    var result = null;
    while( b ){
      params_obj['page'] = page;
      result = await api.getMilestones( user, repo, params_obj, token );
      if( result.status && result.milestones && result.milestones.length > 0 ){
        milestones = milestones.concat( result.milestones );
      }

      if( !result.milestones || result.milestones.length < PER_PAGE ){
        b = false;
      }else{
        page ++;
      }
    }

    res.write( JSON.stringify( { status: true, headers: result.res_headers, milestones: milestones, api_call: page }, null, 2 ) );
    res.end();
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'parameter user & repo are mandatory.' }, null, 2 ) );
    res.end();
  }
});


//. api をエクスポート
module.exports = api;
