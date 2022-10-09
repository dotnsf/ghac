//. cms.js
$( async function(){
  if( TOKEN ){
    var result0 = await getIssues( params );
    //console.log( { result0 } );
    if( result0 && result0.status && result0.issues ){
      $('#cms_head').html( '' );
      $('#cms_main').html( '' );

      if( result0.issues.length > 0 ){
        var numbers = [];
        var heads = '<table class="table" id="issues_table"><thead><tr><th>#</th><th>title</th><th>state</th><th>#comments</th><th>updated</th></tr></thead><tbody>';
        var mains = '';
        var foots = '';
        var pathname = location.pathname;
        //. 並びは番号順でいい？
        for( var i = result0.issues.length - 1; i >= 0; i -- ){
          console.log( result0.issues[i] );
          var num = result0.issues[i].number;
          var comments = result0.issues[i].comments;
          var title = result0.issues[i].title;
          title = title.split( '<' ).join( '&lt;' ).split( '>' ).join( '&gt;' );  //. #10
          var state = result0.issues[i].state;
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
  
          //var head = '&nbsp;<a href="#main_' + num + '">' + title + '(' + comments + ')' + '</a>'
          var anchor = '#main_' + num;
          var head = '<tr><td><a href="' + anchor + '">' + num + '</a></td>'
            + '<td><a href="' + anchor + '">' + title + '</a></td>'
            + '<td><a href="' + anchor + '">' + state + '</a></td>'
            + '<td><a href="' + anchor + '">' + comments + '</a></td>'
            + '<td><a href="' + anchor + '">' + updated + '</a></td></tr>';

          var main = '<div style="margin-top: 50px;">'
            + '<a name="main_' + num + '"/>'
            + '<div id="card_' + num + '" class="card">'
            + '<div class="card-header card-header-' + state + '" title="' + state + '">'
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

        heads += '</tbody></table>';
        $('#cms_head').html( heads );
        $('#cms_main').html( mains );

        $('#issues_table').DataTable({
          order: [ [ 4, 'desc' ] ]
        });

        for( var i = 0; i < numbers.length; i ++ ){
          var num = numbers[i];
          var result1 = await getComments( num );
          if( i == numbers.length - 1 ){
            showRateLimitReset( result1 );
          }
          if( result1 && result1.status && result1.comments && result1.comments.length > 0 ){
            for( var j = 0; j < result1.comments.length; j ++ ){
              var created = getDateTime( result1.comments[j].created_at );
              var updated = getDateTime( result1.comments[j].updated_at );
              var body = ( result1.comments[j].body ? marked.parse( result1.comments[j].body ) : '' );
              var li1 = '<li class="list-group-item" id="li1_' + num + '_' + j + '"><pre>' 
                + body
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
  }else{

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
        //showRateLimitReset( result );
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
        //showRateLimitReset( result );
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
    if( typeof remain == 'string' ){ remain = parseInt( remain ); }
    var limit = result.headers['x-ratelimit-limit'];
    if( typeof limit == 'string' ){ limit = parseInt( limit ); }
    var used = parseInt( 100 * ( limit - remain ) / limit );

    var canvas = document.getElementById( 'mycanvas' );
    if( !canvas || !canvas.getContext ){
      return false;
    }
    var ctx = canvas.getContext( '2d' );

    //. 円を描画
    var r = 15;
    var x0 = 15, y0 = 15;
    /*
    ctx.beginPath();
    ctx.arc( x0, y0, r, 0 * Math.PI / 180, 360 * Math.PI / 180, false );
    ctx.fillStylle = "rgba( 128, 255, 128, 0.8 )";
    ctx.fill();
    ctx.strokeStyle = "green";
    ctx.lineWidth = 5;
    ctx.stroke();
    */

    var deg = ( remain / limit * 360 - 90 );
    console.log( 'remain = ' + remain + ', limit = ' + limit + ', deg = ' + deg );
    ctx.beginPath();
    ctx.arc( x0, y0, r, -90 * Math.PI / 180, deg * Math.PI / 180, false );
    ctx.lineTo( x0, y0 );

    var ratio = remain / limit;
    ctx.fillStyle = ( ratio >= 0.5 ? "rgba( 128, 255, 128, 0.8 )" : ( ratio >= 0.2 ? "rgba( 255, 255, 128, 0.8 )" : "rgba( 128, 128, 255, 0.8 )" ) );
    ctx.fill();

    ctx.font = '9px serif';
    ctx.fillStyle = '#fff';
    var fill_text = remain + '';
    var text_width = ctx.measureText( fill_text ).width;
    ctx.fillText( fill_text, ( 30 - text_width ) / 2, 20, 30 );
    
    var reset = result.headers['x-ratelimit-reset'];
    if( typeof reset == 'string' ){ reset = parseInt( reset ); }
    reset *= 1000;
    var ymdhns = getDateTime( reset ); 

    //$('#ratelimit-remaining').html( remaining );
    $('#ratelimit-reset').html( ymdhns );
    $('#canvas_wrap').prop( 'title', 'API 実行可能回数: ' + remain + '\n次回リセット: ' + ymdhns );
  }else{
    //$('#ratelimit-remaining').html( '--' );
    //$('#ratelimit-reset').html( '--' );
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

