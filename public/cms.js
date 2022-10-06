//. cms.js
$( async function(){
  var result0 = await getIssues( params );
  //console.log( { result0 } );
  if( result0 && result0.status && result0.issues ){
    $('#cms_head').html( '' );
    $('#cms_main').html( '' );

    if( result0.issues.length > 0 ){
      var numbers = [];
      var heads = '';
      var mains = '';
      var foots = '';
      var pathname = location.pathname;
      //. 並びは番号順でいい？
      for( var i = result0.issues.length - 1; i >= 0; i -- ){
        var num = result0.issues[i].number;
        var comments = result0.issues[i].comments;
        var title = result0.issues[i].title;
        var body = ( result0.issues[i].body ? marked.parse( result0.issues[i].body ) : '' );
        var created = getDateTime( result0.issues[i].created_at );
        var updated = getDateTime( result0.issues[i].updated_at );

        var labels = "";
        if( result0.issues[i].labels && result0.issues[i].labels.length > 0 ){
          for( var j = 0; j < result0.issues[i].labels.length; j ++ ){
            var color = "white";
            var background_color = result0.issues[i].labels[j].color;

            var dd = 0;
            for( var k = 0; k < 6; k += 2 ){
              var c = background_color.substr( k, 2 );
              var d = eval( '0x' + c );
              dd += d;
            }
            if( dd > 128 * 3 ){ color = "black"; }

            var label = '&nbsp;<a class="badge badge-pill" style="color: ' + color + '; background-color: #' + background_color + ';" href="' + pathname + '?labels=' + result0.issues[i].labels[j].name + '">' + result0.issues[i].labels[j].name + '</a>';
            labels += label;
          }
        }

        var assignee = "";
        if( result0.issues[i].assignee ){
          assignee = '<img src="' + result0.issues[i].assignee.avatar_url + '" width="24"/>'
            + '<a target="_blank" href="' + result0.issues[i].assignee.html_url + '">' + result0.issues[i].assignee.login + '</a>';
        }

        var milestone = "";
        if( result0.issues[i].milestone ){
          milestone = result0.issues[i].milestone.title;
        }
  
        var head = '&nbsp;<a href="#main_' + num + '">' + title + '(' + comments + ')' + '</a>'
        var main = '<div style="margin-top: 50px;">'
          + '<a name="main_' + num + '"/>'
          + '<div id="card_' + num + '" class="card">'
          + '<div class="card-header">'
          + title + labels
          + '</div>'
          + '<div class="card-body">'
          + '<h6 class="card-subtitle' + ( assignee ? '' : ' mb-2 text-muted' ) + '">担当者: ' + ( assignee ? assignee : "（未アサイン）" ) + '</h6>'
          + '<h6 class="card-subtitle' + ( milestone ? '' : ' mb-2 text-muted' ) + '">対応目途: ' + ( milestone ? milestone : "（未定）" ) + '</h6>'
          + ( body ? '<p class="card-text"><pre>' + body + '</pre></p>' : '' )
          + '<div style="text-align: right; font-size: 10pt;">'
          + '作成日: ' + created
          + ( created != updated ? '<br/>更新日: ' + updated : '' )
          + '</div>'
          + '</div>'
          + '<ul id="ul_' + num + '" class="list-group list-group-flush">'
          + '</ul>'
          + '<a class="btn btn-secondary" target="_blank" href="https://github.com/' + GITHUB_REPO + '/issues/' + num + '"><i class="fab fa-github"></i></a>'
          + '</div>'
          + '</div>';
      
        heads += head;
        mains += main;

        if( comments > 0 ){
          numbers.push( num );
        }
      }

      $('#cms_head').html( heads );
      $('#cms_main').html( mains );

      for( var i = 0; i < numbers.length; i ++ ){
        var num = numbers[i];
        var result1 = await getComments( num );
        if( result1 && result1.status && result1.comments && result1.comments.length > 0 ){
          for( var j = 0; j < result1.comments.length; j ++ ){
            var created = getDateTime( result1.comments[j].created_at );
            var updated = getDateTime( result1.comments[j].updated_at );
            var li1 = '<li class="list-group-item" id="li1_' + num + '_' + j + '"><pre>' 
              + ( result1.comments[j].body ? marked.parse( result1.comments[j].body ) : '' )
              + '</pre>'
              + '<div style="text-align: right; font-size: 10pt;">'
              + '作成日: ' + created
              + ( created != updated ? '<br/>更新日: ' + updated : '' )
              + '</div>'
              + '</li>';
            $('#ul_' + num).append( li1 );
          }
        }
      }
    }
  }else{
    if( result0 && result0.error && result0.error.message ){
      $('#my_toast-body').html( result0.error.message );
      $('#my_toast').toast( { delay: 2000 } );
      $('#my_toast').toast( 'show' );

      $('#debug').html( result0.error.message );
    }
  }
});

async function getIssues( params ){
  return new Promise( async function( resolve, reject ){
    var p = '';
    if( params ){
      p = '&' + params;
    }
    $.ajax({
      type: 'GET',
      url: API_SERVER + '/api/github/issues/' + GITHUB_REPO + '?token=' + TOKEN + p,
      success: function( result ){
        //console.log( result );
        showRateLimitReset( result );
        resolve( result );
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );

        //reject( e0 );
        resolve( { status: false, error: e0, message: JSON.stringify( e0 ) } );
      }
    });
  });
}

async function getComments( issue_num ){
  return new Promise( async function( resolve, reject ){
    $.ajax({
      type: 'GET',
      url: API_SERVER + '/api/github/comments/' + GITHUB_REPO + '?token=' + TOKEN + '&issue_num=' + issue_num,
      success: function( result ){
        //console.log( result );
        showRateLimitReset( result );
        resolve( result );
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
        //reject( e0 );
        resolve( { status: false, error: e0, message: JSON.stringify( e0 ) } );
      }
    });
  });
}

function showRateLimitReset( result ){
  if( result && result.headers && result.headers['x-ratelimit-reset'] ){
    var remain = result.headers['x-ratelimit-remaining'];
    var limit = result.headers['x-ratelimit-limit'];
    var remaining = remain + '/' + limit;
    
    var reset = result.headers['x-ratelimit-reset'];
    if( typeof reset == 'string' ){ reset = parseInt( reset ); }
    reset *= 1000;
    var ymdhns = getDateTime( reset ); 

    $('#ratelimit-remaining').html( remaining );
    $('#ratelimit-reset').html( ymdhns );
  }else{
    $('#ratelimit-remaining').html( '--' );
    $('#ratelimit-reset').html( '--' );
  }
}

function getDateTime( seed ){
  var t = ( seed ? new Date( seed ) : new Date() );

  var y = t.getFullYear();
  var m = t.getMonth() + 1;
  var d = t.getDate();
  var h = t.getHours();
  var n = t.getMinutes();
  var s = t.getSeconds();

  var ymdhns = y
    + '-' + ( m < 10 ? '0' : '' ) + m
    + '-' + ( d < 10 ? '0' : '' ) + d
    + ' ' + ( h < 10 ? '0' : '' ) + h
    + ':' + ( n < 10 ? '0' : '' ) + n
    + ':' + ( s < 10 ? '0' : '' ) + s;

  return ymdhns;
}

function myLogin(){
  location.href = '/login';
}

function myLogout(){
  if( confirm( "ログアウトしますか？" ) ){
    location.href = '/logout';
  }
}

